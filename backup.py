#!/usr/bin/env python
"""
This script was written by Gregory Bolet for the Instructables Community

Description:
	This program uploads the specified folder to Google Drive storage.
    It zips the folder into one file using system calls, then uploads the file.
"""

import httplib2
import os
import time
from apiclient import discovery
from apiclient.http import MediaFileUpload
from oauth2client.service_account import ServiceAccountCredentials

#####################################  PREDEFINES  #####################################
########################################################################################
#Scroll down to main() to see what is happening...

#folder name on drive, if not present: will create new one
GDRIVE_FOLDER_NAME = "database_backups"

#Email address of recipient of folder to be shared
#Can currently only share with one email address per call
#Make sure you spell it correctly
NOTIFICATION_EMIAL_ADDRESS = "elijahblaisdell@gmail.com"

#This tells Google what API service you are trying to use (We are using drive)
#If you are backing up to gdrive, don't change this
SCOPES = 'https://www.googleapis.com/auth/drive'

#This points to the JSON key file for the service account
#You should have downloaded the file when creating your service account 
#It should be in the same directory as this script
KEY_FILE_NAME = 'backup_credentials.json' 

DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
########################################################################################
########################################################################################

def callback(request_id, response, exception):
    if exception:
        # Handle error
        print(exception)
    else:
        print("Permission Id: %s" % response.get('id'))


def get_service():
    """Get a service that communicates to a Google API.
    Returns:
      A service that is connected to the specified API.
    """
    print("Acquiring credentials...")
    credentials = ServiceAccountCredentials.from_json_keyfile_name(filename=KEY_FILE_NAME, scopes=SCOPES)

    #Has to check the credentials with the Google servers
    print("Authorizing...")
    http = credentials.authorize(httplib2.Http())

    # Build the service object for use with any API
    print("Acquiring service...")
    service = discovery.build(serviceName="drive", version="v3", credentials=credentials)

    print("Service acquired!\n")
    return service

def create_mysql_backup(): 
    fileName = getTimestampLabel()
    zipFileName = fileName+".sql.zip"
    os.system(f"mysqldump -h {DB_HOST} -uroot -p{DB_PASSWORD} finances_db | gzip > {zipFileName}")
    print("ZIP file created: "+zipFileName+"\n")
    return zipFileName

def getIDfromName(service, name):
    """Gets the first item with the specified name in the Google Drive
    and returns its unique ID
	Returns: 
		itemID, the unique ID for said G-Drive item name provided
		None (null value), if file not found
    """
    print("Looking for item with name of: "+name)
    results = service.files().list(q="name='"+name+"'", pageSize=1, fields="files(id, name)").execute()
    items = results.get('files', [])
    if not items:
        print("Item not found...\n")
        return None
    itemID = items[0]['id']
    print("Acquired item id: "+itemID+" for item called: "+items[0]['name']+"\n")
    return itemID

def createNewFolder(service,  name):
    """Will create a new folder in the root of the supplied GDrive
    Returns:
        The new folder ID, or the id of the already existing folder
    """
    folderID = getIDfromName(service=service, name=name)
    if folderID is not None:
        return folderID

    folder_metadata = {
        'name' : name,
        'mimeType' : 'application/vnd.google-apps.folder'
    }

    folder = service.files().create(body=folder_metadata, fields='id, name').execute()
    folderID = folder.get('id')
    print('Folder Creation Complete')
    print('Folder Name: %s' % folder.get('name'))
    print('Folder ID: %s \n' % folder.get('id'))
    return folderID

def getTimestampLabel():
	"""Creates and returns a legible timestamp string; 
    used for naming the files and folders
	"""
	return "DATABASE_BACKUP_"+time.strftime("%x").replace("/","-")+"_"+time.strftime("%X")+"_"+str(int(round(time.time())))

def uploadFileToFolder(service, folderID, fileName):
	"""Uploads the file to the specified folder id on the said Google Drive
	Returns: 
		fileID, A string of the ID from the uploaded file
	"""
	print("Uploading file to: "+folderID)
	file_metadata = {
  		'name' : fileName,
  		'parents': [ folderID ]
	}
	media = MediaFileUpload(fileName, resumable=True)
	file = service.files().create(body=file_metadata, media_body=media, fields='name,id').execute()
	fileID = file.get('id')
	print('File ID: %s ' % fileID)
	print('File Name: %s \n' % file.get('name'))

	return fileID

def removeFile(zipFileName):
    """Gets rid of the zip folder we created
    Uses system function calls because they are easier
    """
    print("Removing mysqldump file from system...")
    os.system(f"rm {zipFileName}")
    print("ZIP file "+zipFileName+" removed from local system! :D\n")

def deleteExtraBackupsInDrive(service, folderID):
    response = service.files().list(
        q=f"'{folderID}' in parents",
        fields="files(id, name)"
            ).execute()
    filesList = []
    for file in response.get('files', []):
        filesList.append(file.get('id'))
    if len(filesList) > 30:
        for fileId in filesList[29:]:
            service.files().delete(fileId=fileId).execute()

def removeFilesFromDrive(service, fileIdList):
    for fileId in fileIdList:
        service.files().delete(fileId)


def shareFileWithEmail(service, fileID, emailAddress):
    """Shares the specified file via email
    Grants 'writer' privileges by default, which allows
    one to delete the contents of the folder, but not the folder itself
    """
    print("Sharing file with email: "+emailAddress)
    batch = service.new_batch_http_request(callback=callback)
    user_permission = {
        'type': 'user',
        'role': 'writer',
        'emailAddress': emailAddress
    }
    batch.add(service.permissions().create(
        fileId=fileID,
        body=user_permission,
        fields='id',
    ))
    batch.execute()
    print("Sharing complete!\n")

def main():
    print("Starting filesystem backup...\n")
    service = get_service()

    #get the folder id where we will store the backups
    folderID = createNewFolder(service=service,name=GDRIVE_FOLDER_NAME)

    #create database backup
    zipFileName = create_mysql_backup()

    #upload the file to the Google Drive Folder				                
    uploadFileToFolder(service=service, folderID=folderID, fileName=zipFileName)

    #remove the zip that was created in this files' same directory
    removeFile(zipFileName = zipFileName)

    # Limits files in drive to 30
    deleteExtraBackupsInDrive(service=service, folderID=folderID)
    
    #shares the folder in which the backup is located
    #serves as a notification that a backup is complete
    shareFileWithEmail(service=service, fileID=folderID, emailAddress=NOTIFICATION_EMIAL_ADDRESS)
					                        
    print("Filesystem backup complete...\n")

if __name__ == '__main__':
    main()