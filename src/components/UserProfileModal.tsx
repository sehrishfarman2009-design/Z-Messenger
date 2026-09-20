import React, { useState, useEffect } from "react";
import { Contact, User } from "../types";
import {
  X,
  Mail,
  Calendar,
  Clock,
  Info,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Ban,
  Flag,
  Trash2,
  UserCheck,
} from "lucide-react";

interface UserProfileModalProps {
  user: Contact | User | null;
  currentUser?: User;
  isBlocked?: boolean;
  onClose: () => void;
  onStartChat?: (user: Contact | User) => void;
  onToggleBlock?: (user: Contact | User) => void;
  onReportUser?: (user: Contact | User) => void;
  onDeleteContact?: (user: Contact | User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  isBlocked = false,
  onClose,
  onStartChat,
  onToggleBlock,
  onReportUser,
  onDeleteContact,
}) => {
  const [profileData, setProfileData] = useState<any>(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setProfileData(user);

    // Fetch full live profile data to ensure latest 'about' and status
    let isMounted = true;
    setLoading(true);
    fetch(`/api/users/${user.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.user) {
          setProfileData((prev: any) => ({
            ...prev,
            ...data.user,
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch user profile:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (!user) return null;

  const isSelf = currentUser?.id === user.id;
  const isZAssistant = user.id === "z_assistant_ai";

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Recently";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return "Recently";
    const diffMin = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="user-profile-modal"
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Profile Card Header Banner */}
        <div className="relative h-28 bg-linear-to-r from-orange-400 via-amber-500 to-orange-500 p-4 flex justify-end items-start">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs cursor-pointer transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-14 mb-4">
            <div className="relative">
              <img
                src={
                  profileData.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                }
                alt={profileData.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-neutral-100"
              />
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${
                  profileData.status === "online" ? "bg-emerald-500" : "bg-neutral-400"
                }`}
                title={profileData.status === "online" ? "Online" : "Offline"}
              />
            </div>

            {profileData.status === "online" ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Seen {formatLastSeen(profileData.lastSeen)}
              </span>
            )}
          </div>

          {/* User Name & Handle */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-neutral-900 leading-tight">
                {profileData.fullName}
              </h3>
              {profileData.role === "superadmin" && (
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-orange-600 mt-0.5">
              @{profileData.username}
            </p>
          </div>

          {/* About Section */}
          <div className="mt-4 p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70">
            <div className="flex items-center gap-2 text-xs font-extrabold text-orange-900 uppercase tracking-wider mb-1.5">
              <Info className="w-4 h-4 text-orange-500" />
              <span>About</span>
            </div>
            <p className="text-sm font-medium text-neutral-800 leading-relaxed break-words whitespace-pre-wrap">
              {profileData.about || "Hey there! I am using Z-Messenger."}
            </p>
          </div>

          {/* Additional Details */}
          <div className="mt-3 space-y-2 text-xs text-neutral-600">
            {profileData.email && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Email</p>
                  <p className="text-xs font-medium text-neutral-800 truncate">{profileData.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold text-neutral-400">Member Since</p>
                <p className="text-xs font-medium text-neutral-800">
                  {formatDate(profileData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Row for Block, Report, Delete Contact */}
          {!isSelf && !isZAssistant && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {onToggleBlock && (
                  <button
                    type="button"
                    onClick={() => onToggleBlock(profileData)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isBlocked
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-neutral-50 hover:bg-red-50 text-neutral-700 hover:text-red-700 border-neutral-200 hover:border-red-200"
                    }`}
                  >
                    {isBlocked ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unblock</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Block</span>
                      </>
                    )}
                  </button>
                )}

                {onReportUser && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReportUser(profileData);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-50 hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-200 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Report</span>
                  </button>
                )}
              </div>

              {onDeleteContact && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteContact(profileData);
                    onClose();
                  }}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                  title="Remove from contacts"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Primary Footer Actions */}
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              Close
            </button>
            {onStartChat && (
              <button
                type="button"
                onClick={() => {
                  onStartChat(profileData);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
