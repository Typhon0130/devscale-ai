import { google } from 'googleapis';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const hanlder = async () => {
  try {
    const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    // const authUrl = auth.generateAuthUrl({
    //   access_type: 'offline',
    //   scope: ['https://www.googleapis.com/auth/drive'],
    // });

    const { tokens } = await auth.getToken('your Code');

    const ACCESS_TOKEN = tokens.access_token;

    // Use the access token to authenticate requests
    auth.setCredentials({ access_token: ACCESS_TOKEN });

    // Create a Drive API client
    const drive = google.drive({
      version: 'v3',
      auth,
    });

    // Make a request to list files in a specific folder
    const response = await drive.files.list({
      q: `${GOOGLE_DRIVE_FOLDER_ID} in parents`,
      fields: 'files(id, name)',
    });

    return response.data.files;
  } catch (err) {
    throw err;
  }
};

export default hanlder;
