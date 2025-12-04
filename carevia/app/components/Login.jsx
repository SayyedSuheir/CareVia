

function Login() {
  return (
    <div>
          
    <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden p-8 md:p-10 border border-gray-100">

      
        <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-text-primary mt-2">Welcome Back</h1>
            
        </div>
        
       
        <button className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg text-action-blue font-semibold hover:bg-soft-gray transition duration-150 mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM4.7 6.6l5.3 5.3 5.3-5.3h-10.6zM15 13.9H5c-.55 0-1-.45-1-1v-2.8l5.3 5.3c.39.39 1.02.39 1.41 0l5.3-5.3v2.8c0 .55-.45 1-1 1z" clip-rule="evenodd" fill-rule="evenodd"></path>
            </svg>
            <span>Sign In with Google</span>
        </button>

       
        <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-text-secondary text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

       
        <form action="#" method="POST" className="space-y-6">
            
          
            <div>
                <label for="email" className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <input type="email" id="email" name="email" placeholder="you@example.com" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>

          
            <div>
                <div className="flex justify-between items-center">
                    <label for="password" className="block text-sm font-medium text-text-primary mb-1">Password</label>
                  
                    <a href="#" className="text-sm font-medium text-highlight-gold hover:text-primary-teal transition duration-150">
                        Forgot Password?
                    </a>
                </div>
                <input type="password" id="password" name="password" placeholder="Enter your password" required
                       className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"/>
            </div>
            
         
            <button type="submit"
                    className="w-full py-3 px-4 bg-[#2BB0A8] text-white font-bold rounded-lg  focus:outline-none focus:ring-4 focus:ring-primary-teal focus:ring-opacity-50 transition duration-150 shadow-md shadow-[#2BB0A8]/40">
                Sign In
            </button>
        </form>

        <div className="text-center mt-8">
            <p className="text-text-secondary text-sm">
                Don't have an account? 
                <a href="#" className="text-primary-teal hover:text-action-blue font-medium transition duration-150">
                    Register Here
                </a>
            </p>
        </div>

    </div>
    </div>
  )
}

export default Login