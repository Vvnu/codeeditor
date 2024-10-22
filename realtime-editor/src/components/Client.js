import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    const generateAvatar = (name) => {
        const firstLetter = name.charAt(0).toUpperCase(); // Get the first letter of the username and capitalize it
        return firstLetter;
    };

    return (
        <div className="client">
            <Avatar name={username} size={50} round="14px" src={generateAvatar(username)} /> {/* Use the generated avatar as the src */}
            <span className="username">{username}</span>
        </div>
    );
};

export default Client;
