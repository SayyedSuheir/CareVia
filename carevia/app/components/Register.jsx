"use client";
import { useState, useEffect } from 'react';

function Register() {
  const [countryCodes, setCountryCodes] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '',
    countryName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  useEffect(() => {
    // Fetch country codes from REST Countries API
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags');
        const data = await response.json();
        
        // Process and sort country codes
        const codes = data
          .filter(country => country.idd?.root)
          .map(country => {
            const dialCode = country.idd.root + (country.idd.suffixes?.[0] || '');
            // Replace + with 00
            const formattedDialCode = dialCode.replace('+', '00');
            return {
              name: country.name.common,
              code: country.cca2,
              dialCode: formattedDialCode,
              flag: country.flags.svg
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountryCodes(codes);
        setFilteredCountries(codes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching country codes:', error);
        setLoading(false);
      }
    };

    fetchCountryCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Validate terms acceptance
    if (!formData.terms) {
      alert('Please accept the Terms and Conditions');
      return;
    }

    // Validate country code is selected
    if (!formData.countryCode) {
      alert('Please select a country code');
      return;
    }
    
    // Prepare data for database with combined phone number
    const dataToSubmit = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.countryCode + formData.phone,
      terms: formData.terms
    };
    
    console.log('Data to submit to database:', dataToSubmit);
    
    // API call
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (response.ok) {
          alert(`Registration successful!\nPhone: ${dataToSubmit.phoneNumber}`);
        } else {
          alert(result.error || 'Registration failed. Please try again.');
        }
      } else {
        // API endpoint doesn't exist yet
        console.warn('Registration endpoint not implemented yet. Data ready to submit:', dataToSubmit);
        alert(`Form validated successfully!\nPhone: ${dataToSubmit.phoneNumber}\n\nNote: Please implement /api/register endpoint to complete registration.`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.log('Data was prepared:', dataToSubmit);
      alert(`Form validated successfully!\nPhone: ${dataToSubmit.phoneNumber}\n\nNote: Please implement /api/register endpoint to complete registration.`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If it's the phone field, only allow numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    if (value.trim() === '') {
      setFilteredCountries(countryCodes);
    } else {
      const filtered = countryCodes.filter(country =>
        country.name.toLowerCase().startsWith(value.toLowerCase()) ||
        country.dialCode.includes(value)
      );
      setFilteredCountries(filtered);
    }
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.dialCode,
      countryName: country.name
    }));
    setSearchTerm(country.name);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden p-8 md:p-12 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
        <p className="text-gray-600 text-center mb-8">Join us today and get started</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150"
            />
          </div>

          <div>
            <label htmlFor="country-code-select" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex space-x-3">
              <div className="relative flex-shrink-0 w-40">
                <input
                  type="text"
                  id="country-code-select"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={loading ? "Loading..." : "Search country..."}
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150 bg-white"
                />
                {showDropdown && filteredCountries.length > 0 && (
                  <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className="p-3 hover:bg-teal-50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-700">{country.name}</span>
                        <span className="text-sm font-medium text-teal-600">{country.dialCode}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && filteredCountries.length === 0 && searchTerm && (
                  <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <span className="text-sm text-gray-500">No countries found</span>
                  </div>
                )}
              </div>
              
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="555 123 4567" 
                required
                className="flex-1 p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150"
              />
            </div>
            {formData.countryCode && (
              <p className="text-xs text-gray-600 mt-1">Selected: {formData.countryName} ({formData.countryCode})</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters" 
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password" 
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-teal-500 transition duration-150"
            />
          </div>
          
          <div className="flex items-center">
            <input 
              id="terms" 
              name="terms" 
              type="checkbox" 
              checked={formData.terms}
              onChange={handleChange}
              required
              className="h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500 transition duration-150"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              I agree to the 
              <a href="#" className="text-teal-500 hover:text-blue-600 font-medium"> Terms and Conditions</a>
            </label>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-[#2BB0A8] text-white font-bold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition duration-150 shadow-md shadow-teal-500/40"
          >
            Register 
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Already have an account? 
            <a href="#" className="text-teal-500 hover:text-blue-600 font-medium transition duration-150"> Sign In</a>
          </p>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-600 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        
        <button 
          type="button"
          className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg text-blue-600 font-semibold hover:bg-gray-50 transition duration-150"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign Up with Google</span>
        </button>
      </div>
    </div>
  );
}

export default Register;