
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {recentActivity.map((activity, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           {activity.type === "transfer" && <FiRepeat className="text-blue-500 mr-2" />}
//                           {activity.type === "burn" && <AiOutlineFire className="text-red-500 mr-2" />}
//                           {activity.type === "mint" && <FiGift className="text-green-500 mr-2" />}
//                           <span className="font-medium">{activity.type}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {activity.token}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {activity.amount}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {activity.time}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                           {activity.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Card>
//         </div>
//       )}

// div>
//   );
// };

// export default HomePage;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import {
  FiHome,
  FiTrendingUp,
  FiClock,
  FiGift,
  FiTrash2,
  FiPlus,
  FiRepeat,
  FiInfo,
  FiArrowRight,
  FiBox,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiDatabase,
} from "react-icons/fi";
import {
  BsCoin,
  BsLightningCharge,
  BsShieldCheck,
  BsStars,
  BsCashCoin,
} from "react-icons/bs";
import { AiOutlineFire, AiOutlineSwap } from "react-icons/ai";
import { IoWalletOutline, IoPeopleOutline } from "react-icons/io5";

import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { fetchUserTokens, requestAirdrop } from "../utils/solana";
import Loader from "../components/UI/Loader";
import WalletConnectButton from "../components/Wallet/WalletConnectButton";
import Notification from "../components/UI/Notification";
import useNotification from "../hooks/useNotification";
import WalletInfo from "../components/Wallet/WalletInfo";

const LandingPage = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const {
    notification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
  } = useNotification();

  // Add this state for handling FAQ accordion
  const [activeFaq, setActiveFaq] = useState(null);

  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Request SOL airdrop function from Home.jsx
  const handleAirdrop = async () => {
    if (!publicKey) return;

    try {
      setIsAirdropping(true);
      notifyInfo("Requesting 1 SOL from devnet faucet...");

      const result = await requestAirdrop(publicKey);

      if (result.success) {
        notifySuccess(
          "Airdrop successful! 1 SOL has been added to your wallet."
        );
      } else {
        notifyError("Airdrop failed: try again later.");
      }
    } catch (error) {
      console.error("Error during airdrop:", error);
      notifyError(
        "Airdrop failed: You've either reached your airdrop limit today."
      );
    } finally {
      setIsAirdropping(false);
    }
  };

  // Features data
  const features = [
    {
      icon: <BsCoin className="h-8 w-8 text-indigo-600" />,
      title: "Create Token",
      description:
        "Create your own Solana tokens with custom supply & metadata.",
      link: "/create-token",
    },
    {
      icon: <FiGift className="h-8 w-8 text-green-600" />,
      title: "Mint Tokens",
      description: "Add supply to your existing tokens or mint new ones.",
      link: "/mint-token",
    },
    {
      icon: <FiSend className="h-8 w-8 text-blue-500" />,
      title: "Send Tokens",
      description: "Transfer tokens to other wallets quickly and easily.",
      link: "/send-token",
    },
    {
      icon: <AiOutlineFire className="h-8 w-8 text-orange-500" />,
      title: "Burn Tokens",
      description: "Remove tokens from circulation to manage supply.",
      link: "/burn-token",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "How do I create a token on Solana?",
      answer:
        "Creating a token on Solana is simple with our platform. Connect your wallet, navigate to the Create Token page, fill in your token details including name, symbol, and initial supply, and confirm the transaction. Our system handles all the technical aspects of deploying your token to the Solana blockchain.",
    },
    {
      question: "What fees are associated with token operations?",
      answer:
        "When creating or managing tokens, you'll need to pay Solana network fees which are typically very low (fractions of SOL). Our platform may charge additional fees for certain premium features which will be clearly displayed before you confirm any transaction.",
    },
    {
      question: "How do I get test SOL for development?",
      answer:
        "You can request free SOL on the Solana devnet for testing purposes using our built-in airdrop feature. Just click the 'Request Airdrop' button in the dashboard area when your wallet is connected. Each airdrop adds 1 SOL to your wallet. Note that devnet SOL has no real value.",
    },
    {
      question: "Can I burn tokens after creating them?",
      answer:
        "Yes, you can burn tokens to permanently remove them from circulation. This is useful for reducing supply or implementing deflationary tokenomics. Navigate to the Burn Token section, select the token and amount you wish to burn, and confirm the transaction.",
    },
    {
      question:
        "Are the tokens created on this platform compatible with other Solana wallets?",
      answer:
        "Yes, all tokens created on our platform are SPL tokens (Solana's token standard) and are fully compatible with any Solana-compatible wallet, exchange, or application.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Display notification if present */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          autoClose={notification.autoClose}
          onClose={hideNotification}
        />
      )}

      {/* Hero Section */}
      {/* <div
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl 
      overflow-hidden mb-12"
      >
        <div className="px-8 py-16 sm:p-16 xl:p-20 text-center sm:text-left">
          <div className="max-w-2xl mx-auto sm:mx-0">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Welcome to Solana Token Manager
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
              Create, manage, and transfer Solana tokens with our intuitive
              platform. Build your crypto ecosystem with ease.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center sm:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              {connected ? (
                <Link to="/create-token">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 transition px-8 py-3 rounded-lg shadow-lg flex items-center justify-center w-full">
                    <FiPlus className="mr-2" /> Create Token
                  </Button>
                </Link>
              ) : (
                <WalletConnectButton className=" hover:cursor-pointer bg-white text-indigo-600 hover:bg-indigo-50 transition px-8 py-3 rounded-lg shadow-lg flex items-center justify-center w-full">
                  <IoWalletOutline className="mr-2" /> Connect Wallet
                </WalletConnectButton>
              )}

              <Link to="/home">
                <Button className="hover:cursor-pointer  font-medium bg-transparent text-white border border-white  hover:bg-opacity-10 transition px-8 py-3 rounded-lg flex items-center justify-center w-full">
                  Get Started{" "}
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>


            </div>
          </div>
        </div>

        <div className="relative h-32 bg-indigo-600 md:h-40 lg:h-48">
          <svg
            className="absolute -top-12 left-0 w-full text-indigo-600"
            viewBox="0 0 1440 128"
          >
            <path
              fill="currentColor"
              d="M0,96L60,80C120,64,240,32,360,26.7C480,21,600,43,720,53.3C840,64,960,64,1080,56C1200,48,1320,32,1380,24L1440,16L1440,128L1380,128C1320,128,1200,128,1080,128C960,128,840,128,720,128C600,128,480,128,360,128C240,128,120,128,60,128L0,128Z"
            ></path>
          </svg>
        </div>
      </div> */}




      {/* 2nd ONE  */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="px-4 pt-8 pb-16 sm:p-16 xl:p-20 text-center sm:text-left">
          <div className="max-w-2xl mx-auto sm:mx-0">
            <h1 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Welcome to Solana Token Manager
            </h1>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-indigo-100 max-w-3xl">
              Create, manage, and transfer Solana tokens with our intuitive
              platform. Build your crypto ecosystem with ease.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center sm:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              
            <Link to="/create-token">
            <button className="font-medium hover:cursor-pointer bg-white text-indigo-600 hover:bg-indigo-50 transition px-6 py-3 rounded-full shadow-lg flex items-center justify-center w-full sm:w-auto">
                <span className="mr-2"></span> Create Token
              </button>
              </Link>
 <Link to="/home">
              <button className="font-medium hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition px-6 py-3 rounded-full shadow-lg flex items-center justify-center w-full sm:w-auto">
                {/* Get Started <span className="ml-2">→</span> */}

                Get Started <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave section that matches the image */}
        <div className="relative h-48 sm:h-64">
          {/* First wave (lighter blue) */}
          <div className="absolute w-full h-full">
            <svg
              viewBox="0 0 1440 320"
              className="absolute w-full h-32 sm:h-40"
              preserveAspectRatio="none"
            >
              <path
                fill="rgba(67, 56, 202, 0.7)"
                d="M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,154.7C672,139,768,149,864,154.7C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>

          {/* Second wave (darker blue - matches bottom part of image) */}
          <div className="absolute w-full h-full top-4 sm:top-6">
            <svg
              viewBox="0 0 1440 320"
              className="absolute w-full h-32 sm:h-40"
              preserveAspectRatio="none"
            >
              <path
                fill="rgb(67, 56, 202)"
                d="M0,160L48,144C96,128,192,96,288,101.3C384,107,480,149,576,149.3C672,149,768,107,864,101.3C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>

          {/* Solid color background to match the bottom */}
          <div className="absolute bottom-0 w-full h-20 sm:h-32 bg-indigo-700"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-50 mb-6 flex items-center">
          <FiBox className="mr-2 text-indigo-600" /> Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index} className="group block">
              <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all transform group-hover:-translate-y-1">
                <div className="flex flex-col h-full">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 flex-grow mb-4">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-12 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-12 text-white text-center">
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-center">
            <FiTrendingUp className="mr-2" /> Platform Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <div className="text-indigo-200">Tokens Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1.2M+</div>
              <div className="text-indigo-200">Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">45K+</div>
              <div className="text-indigo-200">Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$120M+</div>
              <div className="text-indigo-200">Value Managed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-50 mb-6 flex items-center">
          <BsStars className="mr-2 text-indigo-600" /> Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-700 ">
                Connect Wallet
              </h3>
              <p className="text-gray-600">
                Connect your Solana wallet to access all features of the
                platform.
              </p>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-700 ">
                Create Your Token
              </h3>
              <p className="text-gray-600">
                Mint your own token with custom supply and metadata in seconds.
              </p>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-700   ">
                Manage & Transfer
              </h3>
              <p className="text-gray-600">
                Send tokens to others, swap for different assets, or burn tokens
                as needed.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-50 mb-6 flex items-center">
          <FiHelpCircle className="mr-2 text-indigo-600" /> Frequently Asked
          Questions
        </h2>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border-b ${
                index === faqs.length - 1 ? "border-none" : "border-gray-200"
              }`}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                {activeFaq === index ? (
                  <FiChevronUp className="text-indigo-600" />
                ) : (
                  <FiChevronDown className="text-gray-500" />
                )}
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden bg-indigo-50 ${
                  activeFaq === index ? "max-h-96 p-6" : "max-h-0 p-0"
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>

                {/* Conditional additional content based on question type */}
                {index === 0 && (
                  <div className="mt-4 flex">
                    <Link to="/create-token">
                      <Button className="hover:cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg flex items-center">
                         Create Your First Token 
                      </Button>
                    </Link>
                  </div>
                )}

                {index === 2 && (
                  <div className="mt-4">
                    <Button
                      onClick={handleAirdrop}
                      disabled={isAirdropping || !connected}
                      className="hover:cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg flex items-center"
                    >
                      <BsCashCoin className="mr-1" />{" "}
                      {isAirdropping ? "Processing..." : "Request Airdrop"}
                    </Button>
                  </div>
                )}

                {index === 3 && (
                  <div className="mt-4 flex">
                    <Link to="/burn-token">
                      <Button className="hover:cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg flex items-center">
                        <FiTrash2 className="mr-1" /> Burn Your Minted Token
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/support"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center"
          >
            <span>View all support articles</span>
            <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>

      {/* CTA Section */}

      <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="px-8 py-12 md:py-16 md:px-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build on Solana?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start creating and managing your tokens today with our intuitive
            platform.
          </p>
          <Link to="/create-token">
            <Button className="hover:cursor-pointer bg-white text-gray-900 hover:bg-gray-100 transition px-8 py-3 rounded-lg shadow-lg">
              Create Your First Token
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
