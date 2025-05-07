import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/context/userAuthContext";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { resetPassword } = useUserAuth();
    const navigate = useNavigate();

    const handleResetPassword = async(e) => {
        e.preventDefault();
        setError("");
        try {
            await resetPassword(email);
            alert("Password reset email sent. Please check your inbox.");
            navigate("/login");
        } catch (error) {
            console.error("Error sending password reset email:", error);
            setError(`Failed to send password reset email: ${error.message}`);
        }
    }
    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 p-2 mb-4 w-full"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Send Reset Email</button>
            </form>
        </div>
    )
 
}

export default ResetPassword