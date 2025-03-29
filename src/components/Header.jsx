import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut, isRecruiter } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            CareerCraft
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/jobs" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Find Jobs
          </Link>
          
          <Link 
            to="/category-forecast" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Category Forecast
          </Link>
          
          {/* Learning Pathway - only for job seekers */}
          {isAuthenticated && !isRecruiter && (
            <Link 
              to="/learning-pathway" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Learning Pathway
            </Link>
          )}
          
          {isAuthenticated && !isRecruiter && (
            <Link 
              to="/job-seeker-dashboard" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          
          {isAuthenticated && isRecruiter && (
            <Link 
              to="/recruiter-dashboard" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          
          <Link 
            to="/about" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Authentication Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationsDropdown />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 font-medium"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="h-9 px-4 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="h-9 px-4 font-medium">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex items-center p-2 rounded-md text-foreground/80 hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/jobs" 
              className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Find Jobs
            </Link>
            
            <Link 
              to="/category-forecast" 
              className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Category Forecast
            </Link>
            
            {/* Learning Pathway - only for job seekers in mobile */}
            {isAuthenticated && !isRecruiter && (
              <Link 
                to="/learning-pathway" 
                className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                Learning Pathway
              </Link>
            )}
            
            {isAuthenticated && !isRecruiter && (
              <Link 
                to="/job-seeker-dashboard" 
                className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated && isRecruiter && (
              <Link 
                to="/recruiter-dashboard" 
                className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            <Link 
              to="/about" 
              className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Contact
            </Link>
            
            <div className="flex flex-col space-y-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex justify-end py-2">
                    <NotificationsDropdown />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;