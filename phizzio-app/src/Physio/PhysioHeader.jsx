import React from 'react';
import logo from '../assets/phizzio_logo.jpeg';
function PhysioHeader(){
    var name = "Aniruddhan";
    return(
        <header className="bg-blue-500 py-4">
        <div className="container mx-auto flex justify-between items-center">
        <img src={logo} alt="Logo" className="h-12 w-35 mr-2 rounded-lg " />
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="text-white hover:text-gray-200 transition duration-300 ease-in-out">Log Out</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    )
}

export default PhysioHeader;