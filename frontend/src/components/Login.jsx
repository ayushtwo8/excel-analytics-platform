import React from "react";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const Login = () => {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2 ">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex justify-center items-center gap-2 text-green-800 font-bold text-2xl">
              <LuChartNoAxesCombined />
              Excelytics
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <form className='flex flex-col gap-6  border p-6 rounded-lg shadow-md '>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to login to your account
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-xs underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" placeholder='********' required />
                  </div>
                  <Button type="submit" className="w-full bg-green-800 hover:bg-green-700">
                    Login
                  </Button>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <Button variant="outline" className="w-full">
                  <FcGoogle />
                    Login with Google
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4 text-blue-700">
                    Sign up
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex align-center items-center justify-start ">
          <img
            src="/login-illustration.jpg"
            alt="Image"
            className="w-4/5 h-auto object-contain"
          />
        </div>
      </div>
    </>
  );
};

export default Login;
