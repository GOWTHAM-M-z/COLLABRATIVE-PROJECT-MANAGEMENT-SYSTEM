"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GoogleMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string) => void;
}

export function GoogleMockModal({ isOpen, onClose, onSelectAccount }: GoogleMockModalProps) {
  const accounts = [
    {
      name: "Alex Johnson",
      email: "alex.johnson@gmail.com",
      avatar: "A"
    },
    {
      name: "Sarah Williams",
      email: "sarah.w@gmail.com",
      avatar: "S"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[400px] bg-[#202124] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
              <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="text-2xl font-normal text-white mb-2">Sign in</h2>
              <p className="text-gray-300 text-sm">Continue to TeamMerge Pro</p>
            </div>

            <div className="border-t border-white/10"></div>

            <div className="flex flex-col py-2">
              {accounts.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectAccount(account.email)}
                  className="flex items-center gap-4 px-8 py-3 hover:bg-white/5 transition-colors text-left w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium text-lg shrink-0">
                    {account.avatar}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-medium truncate">{account.name}</span>
                    <span className="text-gray-400 text-sm truncate">{account.email}</span>
                  </div>
                </button>
              ))}
              
              <div className="border-t border-white/10 my-2"></div>
              
              <button
                onClick={() => onSelectAccount("new.user@gmail.com")}
                className="flex items-center gap-4 px-8 py-3 hover:bg-white/5 transition-colors text-left w-full"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span className="text-gray-300 text-sm font-medium">Use another account</span>
              </button>
            </div>

            <div className="px-8 py-6 bg-black/20 text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-2">
              <a href="#" className="hover:text-white transition-colors">English (United States)</a>
              <div className="flex-1"></div>
              <a href="#" className="hover:text-white transition-colors">Help</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
