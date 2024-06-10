import React from 'react';
import logo from '../assets/phizzio_logo.jpeg';
import { useUser, UserButton, SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
function PhysioHeader(){
    return(
        <header className="bg-blue-500 py-4">
        <div className="container mx-auto flex justify-between items-center">
        <img src={logo} alt="Logo" className="h-12 w-35 mr-2 rounded-lg " />
          <nav>
            <ul className="flex space-x-6">
              <li>
              <SignOutButton>
                <button className="bg-blue-800 text-white hover:bg-blue-900 transition duration-200 px-4 py-2 rounded btn btn-white">Sign Out</button>
              </SignOutButton>
              </li>
              <li>
                <UserButton />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    )
}

export default PhysioHeader;