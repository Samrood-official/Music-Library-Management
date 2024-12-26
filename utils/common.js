import bcrypt from 'bcrypt'
import Users from '../models/User.js';

export const MISSING_FIELDS = 'Bad Request, Reason: Missing';
export const USER_CREATED_SUCCESSFULLY = 'User created successfully.';
export const USER_NOTFOUND = 'User not found.';
export const INCORRECT_PASSWORD = 'incorrect password.';
export const USER_LOGGEDIN = 'Login successful.';
export const USER_LOGGEDOUT = 'Logout Success.';
export const EMAIL_ALREADY_EXISTS = 'Email already exist.';
export const USER_RETRIEVED = 'Users retrieved successfully.';
export const UNAUTHORIZED_ACCESS = 'Unauthorized Access';
export const FORBIDDEN_ACCESS = 'Forbidden Access';
export const BAD_REQUEST = 'Bad Request';
export const INTERNAL_ERROR = 'Internal server error';
export const USER_DELETED = 'User deleted successfully';
export const PASSWORD_UPDATED = 'Password updated successfully';

export const TRUE_STRING = 'true'
export const ARTISTS_FETCHED_SUCCESSFULLY = 'Artist retrieved successfully.'
export const ARTIST_CREATED = 'Artist created successfully.'
export const ARTIST_UPDATED = 'Artist updated successfully.';
export const ARTIST_NOT_FOUND = 'Artist not found.';
export const RESOURCE_NOT_FOUND = 'Resource Doesn\'t Exist.';


export const generateMissingFieldMessage = (missingFields) => {
    const fieldList = missingFields.join(' & ');
    return `${MISSING_FIELDS} ${fieldList}`;
};

export const createNewUser = async ({name, email, password, role}) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
        name,
        email,
        password: hashedPassword,
        role: role || 'viewer',
    });

    await newUser.save();
}

export const isAdmin = (user) => user.role === 'admin'
