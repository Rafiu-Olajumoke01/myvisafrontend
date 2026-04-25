'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './../components/Navbar/Navbar';

// ─── Bottom Nav Icons ──────────────────────────────────────────────────────────
const HomeIcon = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const MyVisaIcon = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const SavedIcon = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      stroke="currentColor"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

function BookmarksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('saved');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const API = 'https://web-production-f50dc.up.railway.app/api/bookmarks/'

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/login?redirect=/bookmarks');
        return;
      }

      const response = await fetch(`${BOOKMARKS_API}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=/bookmarks');
          return;
        }
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      console.log('📚 Bookmarks:', data);

      // Convert image URLs to full paths
      const bookmarksWithFullUrls = (data.bookmarks || []).map(bookmark => ({
        ...bookmark,
        package: {
          ...bookmark.package,
          images: (bookmark.package.images || []).map(img => ({
            ...img,
            image: img.image.startsWith('http') 
              ? img.image 
              : `http://localhost:8000${img.image}`
          }))
        }
      }));

      setBookmarks(bookmarksWithFullUrls);
    } catch (error) {
      console.error('❌ Error fetching bookmarks:', error);
      alert('Failed to load saved packages');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (packageId) => {
    try {
      setDeletingId(packageId);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${BOOKMARKS_API}/${packageId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to remove bookmark');

      // Remove from UI
      setBookmarks(prev => prev.filter(b => b.package.id !== packageId));
      
    } catch (error) {
      console.error('❌ Error removing bookmark:', error);
      alert('Failed to remove bookmark');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePackageClick = (packageId) => {
    router.push(`/package/${packageId}`);
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, route: '/package' },
    { key: 'myvisa', label: 'My Visa', icon: MyVisaIcon, route: '/applications' },
    { key: 'saved', label: 'Saved', icon: SavedIcon, route: '/bookmarks' },
    { key: 'profile', label: 'Profile', icon: ProfileIcon, route: '/dashboard' },
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.key);
    router.push(item.route);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}

      <main className="w-full px-6 pt-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <BookmarkIcon />
              </div>
              <p className="text-gray-900 text-xl font-bold mb-2">No saved packages yet</p>
              <p className="text-gray-500 mb-6">
                Start exploring and save packages you're interested in!
              </p>
              <button
                onClick={() => router.push('/package')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bookmarks.map((bookmark) => {
                const pkg = bookmark.package;
                const isDeleting = deletingId === pkg.id;
                
                return (
                  <div
                    key={bookmark.id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Package Image */}
                    <div 
                      onClick={() => handlePackageClick(pkg.id)}
                      className="relative h-48 overflow-hidden cursor-pointer"
                    >
                      {pkg.images && pkg.images.length > 0 ? (
                        <img
                          src={pkg.images[0].image}
                          alt={pkg.country}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <p className="text-gray-400">No image</p>
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Image count */}
                      {pkg.images && pkg.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <span className="text-white text-xs font-bold">
                            {pkg.images.length} images
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Package Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {pkg.country}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{pkg.visa_type}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-2xl font-black text-blue-600">
                          ${pkg.price}
                        </p>
                        <p className="text-xs text-gray-400">{pkg.processing_time}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePackageClick(pkg.id)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemoveBookmark(pkg.id)}
                          disabled={isDeleting}
                          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Saved date */}
                    <div className="px-4 pb-3">
                      <p className="text-xs text-gray-400">
                        Saved {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <div className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                    <Icon active={isActive} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-12 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default BookmarksPage;