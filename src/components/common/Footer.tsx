
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="assessify-container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Modern online examination platform for educational institutions and organizations.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-assessify-primary dark:hover:text-assessify-accent">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Assessify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
