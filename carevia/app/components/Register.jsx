"use client";

function Register() {
  return (
    <div>
         <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden p-8 md:p-12 border border-gray-100">
   
    

        
        <form action="#" method="POST" className="space-y-6">
            
           
            <div>
                <label for="name" className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input type="text" id="name" name="name" placeholder="John Smith" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>

            
            <div>
                <label for="phone" class="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
                <div class="flex space-x-3">
                    {/* <!-- Country Code Dropdown: Ready for API injection --> */}
                    <select id="country-code-select" name="country-code-select"
                           class="form-input p-3 border border-gray-300 rounded-lg text-text-primary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 flex-shrink-0 w-32 md:w-36 bg-white">
                        {/* <!-- Placeholder option only. Options will be injected by JavaScript. --> */}
                        <option value="" disabled selected>Select Code</option>
                    </select>
                    
                   
                    <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567" required
                           class="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
                </div>
            </div>

           
            <div>
                <label for="email" className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <input type="email" id="email" name="email" placeholder="you@example.com" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>

            <div>
                <label for="password" className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input type="password" id="password" name="password" placeholder="Minimum 8 characters" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>

            
            <div>
                <label for="confirm-password" className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                <input type="password" id="confirm-password" name="confirm-password" placeholder="Repeat your password" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>
            
            
            <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required
                       className="h-4 w-4 text-primary-teal border-gray-300 rounded focus:ring-primary-teal transition duration-150"/>
                <label for="terms" className="ml-2 block text-sm text-text-secondary">
                    I agree to the 
                    <a href="#" className="text-primary-teal hover:text-action-blue font-medium">Terms and Conditions</a>
                </label>
            </div>

            
            <button type="submit"
                    className="w-full py-3 px-4 bg-[#2BB0A8] text-white font-bold rounded-lg  focus:outline-none focus:ring-4 focus:ring-primary-teal focus:ring-opacity-50 transition duration-150 shadow-md shadow-[#2BB0A8]/40">
                Register 
            </button>
        </form>

        <div className="text-center mt-8">
            <p className="text-text-secondary text-sm">
                Already have an account? 
                <a href="#" className="text-primary-teal hover:text-action-blue font-medium transition duration-150">
                    Sign In
                </a>
            </p>
        </div>
         <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-text-secondary text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>
        
            <button className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg text-action-blue font-semibold hover:bg-soft-gray transition duration-150 mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM4.7 6.6l5.3 5.3 5.3-5.3h-10.6zM15 13.9H5c-.55 0-1-.45-1-1v-2.8l5.3 5.3c.39.39 1.02.39 1.41 0l5.3-5.3v2.8c0 .55-.45 1-1 1z" clip-rule="evenodd" fill-rule="evenodd"></path>
            </svg>
            <span>Sign Up with Google</span>
        </button>

       
       
        

    </div>
    </div>
  )
}

export default Register