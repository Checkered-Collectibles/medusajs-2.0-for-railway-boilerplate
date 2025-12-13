"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ResetRequest from "../components/reset-request"
import ResetPassword from "../components/reset-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  RESET_REQ = "reset-request",
  RESET_PASS = "reset-pass"
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(
    LOGIN_VIEW.SIGN_IN
  )

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === LOGIN_VIEW.SIGN_IN && (
        <Login setCurrentView={setCurrentView} />
      )}

      {currentView === LOGIN_VIEW.REGISTER && (
        <Register setCurrentView={setCurrentView} />
      )}

      {currentView === LOGIN_VIEW.RESET_REQ && (
        <ResetRequest setCurrentView={setCurrentView} />
      )}

      {currentView === LOGIN_VIEW.RESET_PASS && (
        <ResetPassword setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate