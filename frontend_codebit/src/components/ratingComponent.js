import React, { useEffect, useState } from "react";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { useSelector } from "react-redux";

export const RatingComponent = ({ codingProfile }) => {
    const { user: user_data = {} } = useSelector((state) => state.profile);
    const [ratings, setRatings] = useState([
        { platform: "LeetCode", rating: null, isLoading: false },
        { platform: "CodeChef", rating: null, isLoading: false },
        { platform: "Codeforces", rating: null, isLoading: false },
    ]);

    useEffect(() => {
        console.log("Fetching ratings for coding profile:", codingProfile);

        const fetchRatings = async () => {
            if (!codingProfile) {
                return;
            }

            setRatings(prev => prev.map(item => ({
                ...item,
                isLoading: true,
                rating: null
            })));

            const { LeetCode, CodeChef, Codeforces } = user_data?.codingProfile || {};

            if (!LeetCode) {
                await Promise.resolve();
                updatePlatformRating("LeetCode", null, false);
            } else {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/fetchleetcoderating/${LeetCode}`,
                        { method: "GET", credentials: "include" }
                    );
                    const data = await response.json();
                    await Promise.resolve();
                    updatePlatformRating("LeetCode", data.success ? Math.ceil(data.rating) : null, false);
                } catch (error) {
                    console.error("Error fetching LeetCode rating:", error);
                    await Promise.resolve();
                    updatePlatformRating("LeetCode", null, false);
                }
            }

            if (!CodeChef) {
                await Promise.resolve();
                updatePlatformRating("CodeChef", null, false);
            } else {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/fetchcodechefrating/${CodeChef}`,
                        { method: "GET", credentials: "include" }
                    );
                    const data = await response.json();
                    await Promise.resolve();
                    updatePlatformRating("CodeChef", data.success ? data.rating : null, false);
                } catch (error) {
                    console.error("Error fetching CodeChef rating:", error);
                    await Promise.resolve();
                    updatePlatformRating("CodeChef", null, false);
                }
            }

            if (!Codeforces) {
                await Promise.resolve();
                updatePlatformRating("Codeforces", null, false);
            } else {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/fetchcodeforcesrating/${Codeforces}`,
                        { method: "GET", credentials: "include" }
                    );
                    const data = await response.json();
                    await Promise.resolve();
                    updatePlatformRating("Codeforces", data.success ? data.rating : null, false);
                } catch (error) {
                    console.error("Error fetching Codeforces rating:", error);
                    await Promise.resolve();
                    updatePlatformRating("Codeforces", null, false);
                }
            }

            console.log("All ratings updated");
        };

        fetchRatings();
    }, [codingProfile, user_data?.codingProfile]);

    const updatePlatformRating = (platform, rating, isLoading) => {
        setRatings(prev =>
            prev.map(item =>
                item.platform === platform
                    ? { ...item, rating, isLoading }
                    : item
            )
        );
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case "LeetCode":
                return <SiLeetcode />;
            case "CodeChef":
                return <SiCodechef />;
            case "Codeforces":
                return <SiCodeforces />;
            default:
                return null;
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case "LeetCode":
                return "text-green-300";
            case "CodeChef":
                return "text-orange-300";
            case "Codeforces":
                return "text-red-300";
            default:
                return "text-white";
        }
    };

    const LoadingPulse = () => (
        <div className="flex space-x-1 justify-center items-center">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
        </div>
    );

    return (
        <div className="mt-4 grid xs:grid-cols-3 gap-4">
            {ratings.map((rating, index) => (
                <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-lg text-center shadow-lg flex flex-col items-center hover:shadow-indigo-500/20 hover:scale-105 duration-300"
                >
                    <div className={`text-2xl ${getPlatformColor(rating.platform)}`}>
                        {getPlatformIcon(rating.platform)}
                    </div>
                    <p className="text-lg font-semibold text-gray-300 mt-2">
                        {rating.platform}
                    </p>
                    <div className="flex items-baseline">
                        {rating.isLoading ? (
                            <div className="py-1">
                                <LoadingPulse />
                            </div>
                        ) : (
                            <>
                                <span className="text-2xl font-bold text-white">
                                    {rating.rating !== null ? rating.rating : "N/A"}
                                </span>
                                <span className="text-sm text-gray-400 ml-1">
                                    {rating.rating !== null ? "rating" : ""}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};