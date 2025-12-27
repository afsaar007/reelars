import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef(new Map());
  const containerRef = useRef(null);


  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/food`, { withCredentials: true })
      .then((res) => {
        setVideos(
          res.data.foodItems.map((v) => ({
            ...v,
            likeCount: v.likeCount ?? 0,
            savesCount: v.savesCount ?? 0,
            isSaved: false,
            isLiked: false,
          }))
        );
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          entry.isIntersecting ? video.play().catch(() => {}) : video.pause();
        });
      },
      { threshold: 0.75 }
    );

    videoRefs.current.forEach((video) => observer.observe(video));
    return () => videoRefs.current.forEach((video) => observer.unobserve(video));
  }, [videos]);

  
  const likeVideo = async (item) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                likeCount: v.isLiked ? v.likeCount - 1 : v.likeCount + 1,
                isLiked: !v.isLiked,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Error liking video:", err);
    }
  };

 
  const saveVideo = async (item) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                savesCount: v.isSaved ? v.savesCount - 1 : v.savesCount + 1,
                isSaved: !v.isSaved,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Error saving video:", err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black pb-32"
    >
      {videos.length > 0 ? (
        videos.map((item) => (
          <div
            key={item._id}
            className="relative h-screen w-full snap-start flex justify-center bg-black"
          >
            <video
              ref={(el) => el && videoRefs.current.set(item._id, el)}
              src={item.video}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
            />

            <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6 text-white text-3xl">
              {/* Like */}
              <button
                onClick={() => likeVideo(item)}
                className={`hover:scale-110 transition ${item.isLiked ? "text-red-500" : "text-white"}`}
              >
                <i className="ri-heart-fill"></i>
              </button>
              <p className="text-sm">{item.likeCount}</p>

        
              <button
                onClick={() => saveVideo(item)}
                className={`hover:scale-110 transition ${item.isSaved ? "text-yellow-400" : "text-white"}`}
              >
                <i className="ri-chat-download-line"></i>
              </button>
              <p className="text-sm">{item.savesCount}</p>

             
              <button className="hover:scale-110 transition">🔗</button>
            </div>

          
            <div className="absolute bottom-0 w-full bg-gradient-to from-black to-transparent p-5 pb-24 text-white">
              <p className="font-semibold text-lg mb-1">{item.name}</p>
              <p className="text-sm mb-3 opacity-90">{item.description}</p>

              <Link
                to={`/food-partner/profile/${item.foodPartner}`}
                className="bg-blue-500 px-4 py-2 rounded-md text-sm w-max"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-white text-center mt-10">No videos available.</p>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around py-3">
        <Link to="/" className="flex flex-col items-center text-gray-700">
          <span className="text-2xl"><i className="ri-home-smile-line"></i></span>
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/user/register" className="flex flex-col items-center text-gray-700">
          <span className="text-2xl"><i className="ri-login-box-line"></i></span>
          <span className="text-xs">Sign Up</span>
        </Link>
        <Link to="/saved" className="flex flex-col items-center text-gray-700">
          <span className="text-2xl"><i className="ri-chat-download-line"></i></span>
          <span className="text-xs">Saved</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
