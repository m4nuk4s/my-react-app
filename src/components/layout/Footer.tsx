import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Tech Support</h3>
            <p className="text-gray-400">Your complete tech support solution for Windowssss operating systems, drivers, and computer repair.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/drivers" className="hover:text-blue-400 transition-colors">Drivers</Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-blue-400 transition-colors">Guides</Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-blue-400 transition-colors">Support</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Windows Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/windows10" className="hover:text-blue-400 transition-colors">Windows 10</Link>
              </li>
              <li>
                <Link to="/windows11" className="hover:text-blue-400 transition-colors">Windows 11</Link>
              </li>
              <li>
                <Link to="/test-tools" className="hover:text-blue-400 transition-colors">Testing Tools</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>© {currentYear} Tech Support Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}