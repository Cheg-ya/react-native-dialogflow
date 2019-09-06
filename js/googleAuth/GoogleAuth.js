import postAsForm from './postAsForm';

const authenticate = async (assertion) => {
    const json = await postAsForm('https://accounts.google.com/o/oauth2/token',
        {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        });

    return JSON.parse(json).access_token;
}

export default authenticate;
