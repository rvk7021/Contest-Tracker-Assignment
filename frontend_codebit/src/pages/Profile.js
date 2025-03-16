import { FaGithub, FaLinkedin, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { CiMail } from "react-icons/ci";
import { MdOutlineLocationOn } from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaEdit, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { RatingComponent } from "../components/ratingComponent";

export default function Profile() {
  const { user: user_data = {} } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);

  const data = user_data?.topics?.map(topic => ({
    topic: topic.topicName,
    problemsSolved: topic.problems.length,
    totalsolved: user_data.problemSolved
  })) ?? [];




  const topicNames = user_data.topics?.map((topic) => topic.topicName) || [];

  const temp = [
    {
      userName: user_data.userName,
      firstName: user_data.firstName,
      lastName: user_data.lastName,
      About: user_data.bio,
      GitHub: user_data.githubProfile,
      college: user_data.college,
      email: user_data.email,
      profilePic: user_data.profilePic,
      topics: topicNames,
      problemsSolved: user_data.problemSolved,
      activeDays: user_data.activeDays?.length || 0,
      submissions: user_data.SubmissionCount,
      problemsCategory: [
        { category: "Easy", problemsSolved: user_data.Easy },
        { category: "Medium", problemsSolved: user_data.Medium },
        { category: "Hard", problemsSolved: user_data.Hard },
      ],
      codingProfile: [
        { profileName: user_data.codingProfile?.LeetCode || "", platform: "LeetCode" },
        { profileName: user_data.codingProfile?.CodeChef || "", platform: "CodeChef" },
        { profileName: user_data.codingProfile?.Codeforces || "", platform: "Codeforces" },
      ],
      location: user_data.Country,
      socialLinks: {
        linkedin: user_data.SocialMedia?.linkedin || "",
        twitter: user_data.SocialMedia?.twitter || "",
        instagram: user_data.SocialMedia?.instagram || "",
        email: user_data.email || "",
      },
    },
  ];


  const [profileForm, setProfileForm] = useState({
    firstName: temp[0].firstName,
    lastName: temp[0].lastName,
    userName: temp[0].userName,
    email: temp[0].email,
    bio: temp[0].About || "",
    country: temp[0].Country || "",
    profilePic: temp[0].profilePic || ""
  });

  const handleProfileFormChange = (field, value) => {
    setProfileForm({
      ...profileForm,
      [field]: value
    });
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const [showGithubForm, setShowGithubForm] = useState(false);

  const [socialLinksForm, setSocialLinksForm] = useState({
    linkedin: temp[0].socialLinks.linkedin || "",
    twitter: temp[0].socialLinks.twitter || "",
    instagram: temp[0].socialLinks.instagram || "",
    email: temp[0].socialLinks.email || ""
  });

  const [githubForm, setGithubForm] = useState(temp[0].GitHub || "");
  const [showPlatformEditForm, setShowPlatformEditForm] = useState(false);
  const [currentEditPlatform, setCurrentEditPlatform] = useState(null);
  const [platformUsernameForm, setPlatformUsernameForm] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);

  const platforms = ["LeetCode", "CodeChef", "Codeforces"];
  const visibleData = showAll ? data : data.slice(0, 5);

  const handleUpdateProfile = () => {
    setShowProfileForm(true);
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const handleSaveProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "All fields are required.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setSavingProfile(true);
    const url = `${process.env.REACT_APP_BASE_URL}/uploadProfile`;

    try {
      let body;
      let headers = {};

      if (profileForm.profilePic && profileForm.profilePic instanceof File) {
        body = new FormData();
        body.append("firstName", profileForm.firstName);
        body.append("lastName", profileForm.lastName);
        body.append("userName", profileForm.userName);
        body.append("bio", profileForm.bio || "");
        body.append("country", profileForm.country || "");
        body.append("file", profileForm.profilePic);
      } else {
        body = JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          userName: profileForm.userName,
          bio: profileForm.bio || "",
          country: profileForm.country || "",
        });
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      window.location.reload();
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully!",
        confirmButtonColor: "#28a745",
      });

      setShowProfileForm(false);
      setProfileUpdated(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update profile.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setProfileUpdated(true);
    }
  };

  useEffect(() => {
    if (profileUpdated) {
      setSavingProfile(false);
      setProfileUpdated(false);
    }
  }, [profileUpdated]);

  const handleGithubButtonClick = () => {
    if (temp[0].GitHub && !showGithubForm) {
      let url = temp[0].GitHub;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, "_blank");
    } else {
      setShowGithubForm(true);
    }
  };

  const handleEditGithub = (e) => {
    setShowPlatformDropdown(false);
    setShowSocialDropdown(false);
    e.stopPropagation();
    setGithubForm(temp[0].GitHub || "");
    setShowGithubForm(true);
  };

  const handleGithubFormChange = (e) => {
    setGithubForm(e.target.value);
  };

  const getProfileLink = (platform, username) => {
    switch (platform.toLowerCase()) {
      case "leetcode":
        return `https://leetcode.com/u/${username}`;
      case "codeforces":
        return `https://codeforces.com/profile/${username}`;
      case "codechef":
        return `https://www.codechef.com/users/${username}`;
      default:
        return "#";
    }
  };

  const handleUpdateGithub = async () => {
    const body = { githubProfile: githubForm.trim() };
    const url = `${process.env.REACT_APP_BASE_URL}/addgithub`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update GitHub");
      }

      Swal.fire({
        icon: "success",
        title: "GitHub Updated",
        text: "GitHub link has been updated successfully!",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update GitHub.",
        confirmButtonColor: "#d33",
      });
    }

    setShowGithubForm(false);
  };

  const handleOpenSocialDropdown = () => {
    setShowPlatformDropdown(false);
    setShowGithubForm(false);
    setSocialLinksForm({
      linkedin: temp[0].socialLinks.linkedin || "",
      twitter: temp[0].socialLinks.twitter || "",
      instagram: temp[0].socialLinks.instagram || "",
      email: temp[0].socialLinks.email || ""
    });
    setShowSocialDropdown(!showSocialDropdown);
  };

  const handleSocialFormChange = (socialPlatform, value) => {
    setSocialLinksForm({
      ...socialLinksForm,
      [socialPlatform]: value
    });
  };

  const handleUpdateSocialLinks = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/addsocialmedia`;

    try {
      const validLinks = Object.entries(socialLinksForm)
        .filter(([platform, link]) => platform !== "email" && link && link.trim() !== "");

      if (validLinks.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Valid Links",
          text: "No valid social media links to update.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const promises = validLinks.map(async ([platform, link]) => {
        const body = { platform, username: link.trim() };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${platform}`);
        }
      });

      await Promise.all(promises);
      window.location.reload();
      Swal.fire({
        icon: "success",
        title: "Social Links Updated",
        text: "All social media links have been updated successfully!",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update social links.",
        confirmButtonColor: "#d33",
      });
    }

    setShowSocialDropdown(false);
  };

  const handleUpdatePlatform = async () => {
    const newProfileName = platformUsernameForm.trim();
    const currentPlatformProfile = temp[0].codingProfile.find(
      (p) => p.platform === currentEditPlatform
    );

    if (currentPlatformProfile.profileName === newProfileName) {
      Swal.fire({
        icon: "error",
        title: "Username Already Exists",
        text: `${newProfileName} already exists.`,
        confirmButtonColor: "#d33",
      });
    } else {
      const body = {
        [currentEditPlatform]: newProfileName
      };

      const url = process.env.REACT_APP_BASE_URL + "/getcodingprofile";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        Swal.fire({
          icon: "success",
          title: "Coding Profile Updated",
          text: `${currentEditPlatform} updated with username ${newProfileName}`,
          confirmButtonColor: "#28a745",
        });
        window.location.reload();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.message,
          confirmButtonColor: "#d33",
        });
      }
    }

    setShowPlatformEditForm(false);
    setCurrentEditPlatform(null);
  };

  const handleAddPlatform = (platformName) => {
    setCurrentEditPlatform(platformName);
    setPlatformUsernameForm("");
    setShowPlatformEditForm(true);
    setShowPlatformDropdown(false);
  };

  const handleRemovePlatform = async (platformName) => {
    const body = {
      platform: platformName
    };

    const url = process.env.REACT_APP_BASE_URL + "/removecodingprofile";

    try {
      setLoading(true);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to remove platform");
      }
      window.location.reload();
      const temp2 = temp;
      temp2[0].codingProfile = temp2[0].codingProfile.filter((p) => p.platform !== platformName);
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Platform Removed",
        text: `${platformName} has been removed successfully.`,
        confirmButtonColor: "#28a745",
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Removal Failed",
        text: error.message,
        confirmButtonColor: "#d33",
      });
    }
    setLoading(false);
    setShowPlatformEditForm(false);
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'linkedin': return <FaLinkedin />;
      case 'twitter': return <FaXTwitter />;
      case 'instagram': return <FaInstagram />;
      case 'email': return <CiMail />;
      default: return null;
    }
  };

  const getSocialColor = (platform) => {
    switch (platform) {
      case 'linkedin': return "text-blue-300 hover:text-blue-400";
      case 'twitter': return "text-gray-300 hover:text-white";
      case 'instagram': return "text-pink-300 hover:text-pink-400";
      case 'email': return "text-indigo-200 hover:text-indigo-400";
      default: return "";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'LeetCode': return <SiLeetcode />;
      case 'CodeChef': return <SiCodechef />;
      case 'Codeforces': return <SiCodeforces />;
      default: return null;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'LeetCode': return "text-green-300";
      case 'CodeChef': return "text-orange-300";
      case 'Codeforces': return "text-red-300";
      default: return "text-white";
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-32 h-32 rounded-full border-4 border-gray-700 border-opacity-25"></div>

            {/* Spinning gradient border */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-4 border-t-teal-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin"></div>

            {/* Inner pulsing circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-purple-500 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 pt-16 sm:pt-20 lg:px-10 lg:pt-20 p-2">
          <div className="profile-box grid lg:grid-cols-[30%,70%] md:gap-2 md:p-2 lg:gap-4">
            <div className="profile-section-parent p-1 items-center">
              <div className="profile-section flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-lg items-center shadow-xl shadow-indigo-500/20 p-3 relative">
                <button
                  onClick={handleUpdateProfile}
                  className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 flex items-center gap-1"
                >
                  <FaEdit /> Update Profile
                </button>
                {showProfileForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl w-full max-w-md md:max-w-lg mx-auto my-4 relative">
                      <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Update Profile</h2>
                      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <div className="md:grid md:grid-cols-2 md:gap-4">
                          <div className="mb-4 md:mb-0">
                            <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => handleProfileFormChange("firstName", e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => handleProfileFormChange("lastName", e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-4">
                          <div className="mb-4 md:mb-0">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => handleProfileFormChange("email", e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                              type="text"
                              value={profileForm.userName}
                              disabled
                              onChange={(e) => handleProfileFormChange("userName", e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                          <textarea
                            value={profileForm.bio}
                            onChange={(e) => handleProfileFormChange("bio", e.target.value)}
                            rows="3"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          ></textarea>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-4">
                          <div className="mb-4 md:mb-0">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                            <input
                              type="text"
                              value={profileForm.country}
                              onChange={(e) => handleProfileFormChange("country", e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleProfileFormChange("profilePic", e.target.files[0])}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleSaveProfile}
                          className={`flex-1 ${savingProfile ? "bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-md py-2 transition-all duration-300 flex items-center justify-center`}
                          disabled={savingProfile}
                        >
                          {savingProfile ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          onClick={() => setShowProfileForm(false)}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-md py-2 transition-all duration-300"
                          disabled={savingProfile}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <img
                  src={temp[0].profilePic}
                  alt="profile"
                  className="h-[150px] w-[150px] mt-2 rounded-full bg-black border-4 border-indigo-200/20"
                />
                <h1 className="text-2xl font-bold text-white mt-4">
                  {user_data.firstName + " " + temp[0].lastName}
                </h1>
                <h4 className="text-indigo-200 font-medium">
                  @{temp[0].userName}
                </h4>
                <div className="relative w-full flex justify-center mt-3">
                  {temp[0].GitHub && temp[0].GitHub.trim() !== "" && !showGithubForm ? (
                    <div className="relative w-[300px] xs:w-[400px] md:w-[340px] sm:w-[400px]">
                      <button
                        onClick={handleGithubButtonClick}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xl font-semibold px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg group justify-center"
                      >
                        <FaGithub className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                        <span>GitHub</span>
                      </button>
                      <button
                        onClick={handleEditGithub}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-800 text-white p-1.5 rounded-full transition-all duration-300"
                        title="Edit GitHub Link"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                    </div>
                  ) : showGithubForm ? (
                    <div className="bg-slate-800 w-[300px] xs:w-[400px] md:w-[340px] sm:w-[400px] p-4 rounded-lg shadow-lg mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaGithub className="text-xl text-white" />
                        <h3 className="text-white font-semibold">GitHub Profile</h3>
                      </div>
                      <input
                        type="text"
                        value={githubForm}
                        onChange={handleGithubFormChange}
                        placeholder="Enter GitHub URL"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 mt-1 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleUpdateGithub}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 transition-all duration-300"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowGithubForm(false)}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-md py-2 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGithubButtonClick}
                      className="w-[300px] xs:w-[400px] md:w-[340px] sm:w-[400px] bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xl font-semibold px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg group justify-center"
                    >
                      <FaGithub className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                      <span>Add GitHub</span>
                    </button>
                  )}
                </div>
                <p className="text-gray-200 text-center mt-4 font-mono">{temp[0].About}</p>
                <div className="flex gap-6 mt-2 p-2 w-full justify-center border-b-2 border-t-2 border-gray-900 relative">
                  {Object.entries(temp[0].socialLinks).map(([platform, link], index) =>
                    link && (
                      <a
                        key={index}
                        href={platform === 'email' ? `mailto:${link}` : link}
                        className={`text-2xl ${getSocialColor(platform)} transition-all duration-300 transform hover:scale-110`}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    )
                  )}
                  <button
                    onClick={handleOpenSocialDropdown}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-full transition-all duration-300"
                    title="Update Social Media"
                  >
                    <FaEdit className=" text-sm" />
                  </button>
                  {showSocialDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-slate-800 shadow-lg rounded-lg z-20 p-4 w-64 border border-slate-700">
                      <div className=" inset-0 bg-transparent z-10" onClick={() => setShowSocialDropdown(false)}></div>
                      <div className="relative z-20">
                        <h3 className="text-white font-semibold mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
                          <FaEdit className="text-indigo-400" />
                          Update Social Links
                        </h3>
                        {Object.entries(socialLinksForm).filter(([platform]) => platform !== "email").map(([platform, link]) => (
                          <div key={platform} className="mb-3">
                            <label className="text-slate-300 text-sm flex items-center gap-2">
                              {getSocialIcon(platform)}
                              <span className="capitalize">{platform}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={link}
                                onChange={(e) => handleSocialFormChange(platform, e.target.value)}
                                placeholder={`Enter ${platform} URL`}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1 mt-1 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleUpdateSocialLinks}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 transition-all duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowSocialDropdown(false)}
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-md py-2 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="location flex items-center gap-2 mt-2 bg-indigo-950/50 p-2 w-full rounded-lg">
                  <MdOutlineLocationOn className="text-xl text-indigo-300" />
                  <span className="mt-1 font-bold text-gray-300">
                    {temp[0].location}
                  </span>
                </div>
                <div className="college-name flex items-center justify-start gap-2 p-2 w-full bg-indigo-950/50 mt-2 rounded-lg">
                  <GiGraduateCap className="text-xl text-indigo-300" />
                  <span className="mt-1 text-base font-bold text-gray-300">
                    {temp[0].college}
                  </span>
                </div>
                <div className="coding-profile-section grid grid-cols-2 pc:grid-cols-3 lg:grid-cols-2 xs:grid-cols-3 mt-2 md:p-3 p-1 w-full relative">
                  <h1 className="text-[24px] mt-4 sm:mt-0 col-span-2 pc:col-span-3 xs:col-span-3 lg:col-span-2 mb-2 text-center font-bold text-white bg-indigo-600/20 rounded-lg py-2 font-mono">
                    Techies' Arena
                  </h1>
                  {showPlatformDropdown && (
                    <div className="absolute right-4 top-14 bg-slate-800 shadow-lg rounded-lg z-20 p-2 w-48 border border-slate-700">
                      <div className=" inset-0 bg-transparent z-10" onClick={() => setShowPlatformDropdown(false)}></div>
                      <div className="relative z-20">
                        <h3 className="text-white font-semibold px-2 py-1 border-b border-slate-700 mb-1 flex items-center gap-2">
                          <FaPlus className="text-indigo-400" />
                          Manage Platforms
                        </h3>
                        {platforms.map((platformName) => {
                          const platformProfile = temp[0].codingProfile.find(p => p.platform === platformName);
                          return (
                            <div key={platformName} className="p-2 hover:bg-slate-700 rounded flex justify-between items-center">
                              <div
                                onClick={() => handleAddPlatform(platformName)}
                                className="flex items-center gap-2 cursor-pointer text-white"
                              >
                                <span className={getPlatformColor(platformName)}>
                                  {getPlatformIcon(platformName)}
                                </span>
                                <span>{platformName}</span>
                              </div>
                              {platformProfile && (
                                <button
                                  onClick={() => handleRemovePlatform(platformName)}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs transition-all duration-300"
                                  title={`Remove ${platformName}`}
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {showPlatformEditForm && (
                    <div className="absolute right-4 top-14 bg-slate-800 shadow-lg rounded-lg z-20 p-4 w-64 border border-slate-700">
                      <div
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={(e) => {
                          if (!e.target.closest(".platform-edit-container")) {
                            setShowPlatformEditForm(false);
                          }
                        }}
                      ></div>
                      <div className="relative z-20 platform-edit-container">
                        <h3 className="text-white font-semibold mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
                          <span className={getPlatformColor(currentEditPlatform)}>
                            {getPlatformIcon(currentEditPlatform)}
                          </span>
                          {currentEditPlatform} Profile
                        </h3>
                        <div className="mb-3">
                          <label className="text-slate-300 text-sm">Username</label>
                          <input
                            type="text"
                            value={platformUsernameForm}
                            onChange={(e) => setPlatformUsernameForm(e.target.value)}
                            placeholder={`Enter your ${currentEditPlatform} username`}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 mt-1 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleUpdatePlatform}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 transition-all duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowPlatformEditForm(false)}
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-md py-2 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                    className="absolute right-2 top-2 bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded-md text-sm transition-all duration-300 flex items-center gap-1"
                  >
                    <FaEdit /> Manage
                  </button>
                  {platforms.map((platformName) => {
                    const platformProfile = temp[0].codingProfile.find(p => p.platform === platformName);
                    if (!platformProfile || !platformProfile.profileName) return null;

                    return (
                      <a
                        key={platformName}
                        href={getProfileLink(platformName, platformProfile.profileName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m-2 shadow-sm shadow-purple-400 bg-indigo-900/40 p-2 rounded-lg 
                    hover:bg-indigo-800/40 hover:scale-105 transition-all duration-300 block"
                      >
                        <div className="inline-flex items-center gap-2">
                          <span className={getPlatformColor(platformName)}>
                            {getPlatformIcon(platformName)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-mono text-gray-200 font-semibold">{platformName}</span>
                            <span className="text-xs text-gray-300">{platformProfile.profileName}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                  {!temp[0].codingProfile.some(p => platforms.includes(p.platform) && p.profileName) && (
                    <div className="col-span-2 pc:col-span-3 xs:col-span-3 lg:col-span-2 text-center text-gray-400 p-4">
                      No coding platforms added. Click "Manage" to add your profiles.
                    </div>
                  )}
                </div>
                <div className="w-full mt-0 gap-1 p-1 grid grid-cols-2 lg:grid-cols-2 pc:grid-cols-3 xs:grid-cols-3 py-2 font-mono">
                  <h1 className="text-[24px] pb-2 mb-1 col-span-2 pc:col-span-3 lg:col-span-2 xs:col-span-3 text-center font-bold text-white border-b border-indigo-400 shadow-lg shadow-indigo-500/20">
                    Topics Solved
                  </h1>
                  {temp[0].topics.map((topic, index) => (
                    <button
                      className="mt-1 mb-1 font-sans bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-full text-md md:text-sm shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex justify-center items-center"
                      key={index}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="stats-section-parent shadow-sm p-1">
              <div className="grid xs:grid-cols-3 gap-4 ">
                {[
                  { title: "Problems Solved", value: `${temp[0].problemsSolved}` },
                  { title: "Active Days", value: `${temp[0].activeDays}` },
                  { title: "Submissions", value: `${temp[0].submissions}` }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-r from-indigo-900 to-slate-900 md:p-6 rounded-lg text-center shadow-lg flex flex-col items-center
                hover:shadow-indigo-500/20 hover:scale-105 duration-300"
                  >
                    <p className="text-xl md:text-2xl font-semibold text-gray-300">{stat.title}</p>
                    <span className="text-xl md:text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid xs:grid-cols-[60%,40%] gap-4 p-4">
                <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-lg text-center shadow-xl flex flex-col items-center">
                  <p className="text-4xl font-mono font-bold text-white mt-1">DSA Tracker</p>
                  <div className="w-full p-4 mt-2 rounded-lg">
                    <div className="space-y-6">
                      {visibleData.map((item, index) => {
                        const progress = (item.problemsSolved / item.totalsolved) * 100;
                        return (
                          <div key={index} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-base font-semibold text-white">{item.topic}</p>
                              <span className="text-md text-gray-200 font-medium">
                                {item.problemsSolved} / {item.totalsolved}
                              </span>
                            </div>
                            <div
                              className="relative group"
                              onMouseEnter={() => setHoveredIndex(index)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              <div className="w-full bg-slate-200 rounded-md overflow-hidden">
                                <div
                                  className="h-[10px] bg-indigo-600 transition-all duration-300 rounded-md"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              {hoveredIndex === index && (
                                <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-indigo-900 text-white px-3 py-1 rounded text-sm font-medium shadow-lg z-10 whitespace-nowrap">
                                  Solved: {item.problemsSolved} of {item.totalsolved}
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-solid border-t-indigo-900 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {data.length > 5 && (
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all duration-300 flex items-center mx-auto gap-2"
                        >
                          {showAll ? (
                            <>
                              <FaMinus className="text-sm" /> Show Less
                            </>
                          ) : (
                            <>
                              <FaPlus className="text-sm" /> Show More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-lg shadow-lg p-4">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Problem Categories</h3>
                  <div className="space-y-6">
                    {temp[0].problemsCategory.map((category, index) => {
                      const total = temp[0].problemsSolved;
                      const percentage = (category.problemsSolved / total) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-base font-semibold text-white">{category.category}</p>
                            <span className="text-sm text-gray-300">
                              {category.problemsSolved} problems
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category.category === 'Easy'
                                  ? 'rgb(34, 197, 94)'
                                  : category.category === 'Medium'
                                    ? 'rgb(234, 179, 8)'
                                    : 'rgb(239, 68, 68)'
                              }}
                            ></div>
                          </div>
                          <p className="text-right text-xs text-gray-400 mt-1">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <RatingComponent key={JSON.stringify(user_data?.codingProfile)} codingProfile={user_data?.codingProfile} />
            </div>
          </div>
        </div>)}
    </>
  );
}