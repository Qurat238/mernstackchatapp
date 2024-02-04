import React from 'react';
import "./SearchResultList.css";

const SearchResultList = ({ user, handleFunction }) => {
  return (
        <div className='searchedUser' onClick={handleFunction} style={{cursor:"pointer"}}>
          <div className='searchedUserPic'>
            <img src={user.avatar.url} alt='user pic'/>
          </div>
            <div className='searchedUserInfo'>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
            </div>
        </div>
  )
}

export default SearchResultList
