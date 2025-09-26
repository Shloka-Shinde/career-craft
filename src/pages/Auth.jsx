import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { signUp, signIn, isAuthenticated, isLoading, isRecruiter, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  
  // Sign In state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);
  
  // Sign Up state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRecruiterSignup, setIsRecruiterSignup] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Redirect if already authenticated based on user role
  if (isAuthenticated && !isLoading) {
    console.log("User is authenticated, isRecruiter:", isRecruiter);
    return <Navigate to="/" />;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!signinEmail || !signinPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSigninLoading(true);
      const user = await signIn(signinEmail, signinPassword);
      // After sign in, check if profile exists
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (profileError || !profile) {
          // Insert profile if not exists
          const accountType = localStorage.getItem('accountType');
          const isRecruiter = accountType === 'recruiter';
          console.log('[DEBUG] Inserting profile after login with is_recruiter:', isRecruiter);
          await supabase.from('profiles').insert([
            { id: userId, is_recruiter: isRecruiter }
          ]);
          localStorage.removeItem('accountType');
        } else {
          console.log('[DEBUG] Profile already exists after login:', profile);
        }
      }
      // No need to navigate manually - the redirect in render method will handle it
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setSigninLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Only require name for job seekers, not recruiters
    if (!isRecruiterSignup && !fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSignupLoading(true);
      await signUp(signupEmail, signupPassword);

      // Wait for session to be available
      let sessionData = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          sessionData = data;
          break;
        }
        await new Promise(res => setTimeout(res, 300));
      }

      if (!sessionData || !sessionData.session?.user) {
        console.error("[DEBUG] No session found after signup, cannot insert profile");
        toast({
          title: "Error",
          description: "Could not complete signup. Please try again.",
          variant: "destructive",
        });
        setSignupLoading(false);
        return;
      }

      // Upsert profile with correct is_recruiter value and full name
      console.log("UPSERTING PROFILE with is_recruiter:", isRecruiterSignup, typeof isRecruiterSignup);
      const profileData = {
        id: sessionData.session.user.id,
        is_recruiter: !!isRecruiterSignup
      };

      // Add full name only for job seekers
      if (!isRecruiterSignup && fullName.trim()) {
        profileData.full_name = fullName.trim();
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData])
        .select();

      if (error) {
        console.error('Error upserting profile:', error);
        toast({
          title: "Error",
          description: "Could not create profile. Please try again.",
          variant: "destructive",
        });
        setSignupLoading(false);
        return;
      }

      // Redirect based on account type
      window.location.href = isRecruiterSignup ? "/recruiter-dashboard" : "/job-seeker-dashboard";
      toast({
        title: "Account created",
        description: "Please proceed to set up your profile",
      });
    } catch (error) {
      console.error("[DEBUG] Error signing up:", error);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to CareerCraft</CardTitle>
              <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <Button variant="link" type="button" className="p-0 h-auto font-normal">
                          Forgot password?
                        </Button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={signinLoading}>
                      {signinLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="py-2">
                      <div className="flex items-center justify-between mb-4">
                        <Label htmlFor="account-type" className="text-sm font-medium">Account Type</Label>
                        <div className="flex items-center space-x-2">
                          <span className={!isRecruiterSignup ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
                            Job Seeker
                          </span>
                          <Switch
                            id="account-type"
                            checked={isRecruiterSignup}
                            onCheckedChange={(checked) => {
                              console.log("[LOG] Switch toggled, value:", checked, typeof checked);
                              setIsRecruiterSignup(checked);
                              // Clear name field when switching to recruiter
                              if (checked) {
                                setFullName("");
                              }
                            }}
                          />
                          <span className={isRecruiterSignup ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
                            Recruiter
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Show name field only for job seekers */}
                    {!isRecruiterSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name *</Label>
                        <Input
                          id="full-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={signupLoading}>
                      {signupLoading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" type="button" className="w-full">
                  Google
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  GitHub
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  Twitter
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;