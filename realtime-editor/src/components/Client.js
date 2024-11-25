import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username, avatar }) => {
    return (
        <div className="client">
            {/* Use the avatar prop passed to the component */}
            <Avatar name={username} size={50} round="14px" src={avatar} /> 
            <span className="username">{username}</span>
        </div>
    );
};

export default Client;
