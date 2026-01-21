"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

interface SessionTimeoutProps {
    session: Session | null;
    timeoutDuration?: number; // Duration in milliseconds, default 1 hour
}

export default function SessionTimeout({ session, timeoutDuration = 3600000 }: SessionTimeoutProps) {
    // 1 hour = 60 * 60 * 1000 = 3,600,000 ms

    // We only need to track activity if there is a session
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Use a ref for the timer to easily clear it
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!session) return;

        const events = [
            "mousemove",
            "mousedown",
            "click",
            "scroll",
            "keypress",
            "touchmove" // for mobile
        ];

        const resetTimer = () => {
            setLastActivity(Date.now());
        };

        // Add event listeners
        for (const event of events) {
            window.addEventListener(event, resetTimer);
        }

        // Check for inactivity periodically
        const intervalId = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity >= timeoutDuration) {
                // Timeout reached
                signOut({ callbackUrl: "/login?reason=timeout" }); // Redirect to login
            }
        }, 1000); // Check every second

        return () => {
            // Cleanup
            for (const event of events) {
                window.removeEventListener(event, resetTimer);
            }
            clearInterval(intervalId);
        };
    }, [session, lastActivity, timeoutDuration]);

    return null; // This component does not render anything
}
