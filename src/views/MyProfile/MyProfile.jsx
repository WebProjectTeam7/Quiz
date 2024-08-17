import './MyProfile.css';
import { useState } from 'react';

const MyProfile = () => {
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    const togglePasswordChange = () => {
        setShowPasswordChange(!showPasswordChange);
    };

    return (
        <div className='profile-container'>
            <h2>My Profile</h2>
            <div className='profile-image'>
                <button className='image-button'>Add Image +</button>
            </div>
            <form>
                <input type='text' placeholder='Username' />
                <input type='text' placeholder='First Name' />
                <input type='text' placeholder='Last Name' />
                <input type='email' placeholder='Email' />
                <input type='tel' placeholder='Phone Number' />
                <div className='button-container'>
                    <button type='button' className='change-password' onClick={togglePasswordChange}>
                        Change Password
                    </button>
                    <button type='submit' className='save-button'>
                        Save
                    </button>
                    <button type='button' className='discard-button'>
                        Discard Changes
                    </button>
                </div>
            </form>
            {showPasswordChange && (
                <div className='password-change-container'>
                    <input type='password' placeholder='Old password' />
                    <input type='password' placeholder='New password' />
                    <input type='password' placeholder='Confirm new password' />
                    <button className='save-button'>Save</button>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
