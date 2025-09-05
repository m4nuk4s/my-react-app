import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Laptop, Cpu, Smartphone, HardDrive, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure this is loaded in your app
import fnImg from '../assets/wtpth/fn.jpg';
import mtImg from '../assets/wtpth/mute.jpg';
import BackVideo from "@/assets/wtpth/backvi.mp4"; // Import the video
import camimg from '../assets/wtpth/cam.jpg';
import btimg from '../assets/wtpth/bt.jpg';
import micimg from '../assets/wtpth/mic.jpg';
import fn2 from '../assets/wtpth/fn2.jpg';
import fnesc from '../assets/wtpth/fnesc.jpg';
import nlk from '../assets/wtpth/nlk.jpg';
import plane from '../assets/wtpth/plane.jpg';

export default function Guides() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const guides = [
	{// ID 1
	  id: 1,
	  title: "🔇No sound is produced",
	  category: "Hardware",
	  difficulty: "easy",
	  time: "10 minutes",
	  description:
		"This page summarizes the steps to be followed in the case of a sound malfunction.\n\nYou can carry out level 1 steps directly with the customer (remote or face-to-face).	\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center."
	},
	{// ID 2 
	  id: 2,
	  title: "Camera doesn't work",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a camera malfunction. You can carry out level 1 steps directly with the customer (remote or face-to-face). \n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.  ",
	  thumbnail: "",
	},
	{// ID 3	
	  id: 3,
	  title: "Device can't connect to Bluetooth",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a bluetooth malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 4	
	  id: 4,
	  title: "Device doesn't start up correctly",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a bluetooth malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 5	
	  id: 5,
	  title: "Microphone doesn't work",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "15 minutes",
	  description: "This page summarizes the steps to be followed in the case of a microphone malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 6	
	  id: 6,
	  title: "Screen doesn't work",
	  category: "Hardware",
	  difficulty: "hard",
	  time: "20 minutes",
	  description: "This page summarizes the steps to be followed in the case of a screen malfunction.  \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 7	
	  id: 7,
	  title: "Touchpad doesn't work",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "20 minutes",
	  description: "This page summarizes the steps to be followed in the case of a touchpad malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 8	
	  id: 8,
	  title: "Keyboard doesn't work",
	  category: "Hardware",
	  difficulty: "easy",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a Keyboard malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 9	
	  id: 9,
	  title: "Device can't connect to Wi-Fi or a network",
	  category: "Hardware",
	  difficulty: "easy",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a  Wi-Fi  malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 10	
	  id: 10,
	  title: "Device doesn't switch on",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "20 minutes",
	  description: "This page summarizes the steps to be followed in the case of a power on/off  malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 11	
	  id: 11,
	  title: "Device doesn't recharge. Battery life is limited",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a battery charging  malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 12	
	  id: 12,
	  title: "Device turns off unexpectedly",
	  category: "Hardware",
	  difficulty: "moderate",
	  time: "10 minutes",
	  description: "This page summarizes the steps to be followed in the case of a device malfunction. . \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 13	
	  id: 13,
	  title: "Windows doesn't activate",
	  category: "software",
	  difficulty: "easy",
	  time: "5 minutes",
	  description: "This page summarizes the steps to be followed in the case of a Windows Activation malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 14	
	  id: 14,
	  title: "Windows runs abnormally",
	  category: "Windows",
	  difficulty: "easy",
	  time: "5 minutes",
	  description: "This page summarizes the steps to be followed in the case of a Windows malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 15	
	  id: 15,
	  title: "Blocking on shell",
	  category: "software",
	  difficulty: "easy",
	  time: "5 minutes",
	  description: "This page summarizes the steps to be followed in the case of a Windows boot malfunction. \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 16	
	  id: 16,
	  title: "Password not working",
	  category: "software",
	  difficulty: "easy",
	  time: "5 minutes",
	  description: "This page summarizes the steps to be followed in the case of a password malfunction.  \n\n You can carry out level 1 steps directly with the customer (remote or face-to-face).\n\n If the Level 1 steps do not fix the malfunction, please complete the Level 2 steps in the repair center.    ",
	},
	{// ID 17	
	  id: 17,
	  title: "TOUCHPAD FIRMWARE UPDATE",
	  category: "Firmares",
	  difficulty: "easy",
	  time: "5 minutes",
	  description: "This touchpad update brings an important fix to the touchpad on Thomson  \n\n (XX)N15I310-8GR256, (XX)N15I510-16GR512 notebooks, which in some cases can produce unintended cursor movements.\n\n ",
	},
  ];

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories", icon: <Search className="h-4 w-4" /> },
    { value: "Hardware", label: "Hardware", icon: <Cpu className="h-4 w-4" /> },
    { value: "Windows", label: "Windows", icon: <Cpu className="h-4 w-4" /> },
    { value: "Firmares", label: "Firmware", icon: <Cpu className="h-4 w-4" /> },
    { value: "storage", label: "Storage", icon: <HardDrive className="h-4 w-4" /> },
    { value: "software", label: "Software", icon: <PenTool className="h-4 w-4" /> },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={BackVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold text-white mb-0">
            Computer Repair Guides
          </h1>
          <p className="text-xl text-blue-50 mb-10 max-w-2xl text-center mx-auto drop-shadow">
            Step-by-step disassembly and repair guides for your devices
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Featured Guide */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <Badge variant="outline" className="w-fit text-white border-white mb-4">
                Featured Guide
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Troubleshooting Guides</h2>
              <p className="mb-6">
                Our comprehensive troubleshooting guides covers everything from boot issues to performance
                problems. Learn how to diagnose and fix the most common computer problems by yourself.
              </p>
              
            </div>
            <div className="md:w-2/5 bg-blue-900 flex items-center justify-center p-8">
              <div className="text-8xl">🔧</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          <div className="md:col-span-4">
            <div className="relative">
              
              <Input
                placeholder="🔎Search for guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="flex items-center">
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Guide Results */}
        <div>
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="text-5xl">{/* texto */}</span>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start text-lg text-blue-800 pointer-events-none">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <Badge className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <span className="mr-1">⏱️</span> {guide.time}
                    </CardDescription>
                  </CardHeader>
                
                    <CardContent>
                    
                    {guide.description.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </CardContent>
                  {/* Accordion added here for each guide */}{/* Accordion added here for each guide */}{/* Accordion added here for each guide */}
                  <div className="bg-white rounded-xl shadow p-4 mt-4">
                  <Accordion defaultActiveKey={null}>
				 
			 
				 
  {guide.id === 1 && ( //GUIDE ID  1 LVL 1
    <>
	
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
      <Accordion.Header>
  <span className="font-bold">Try to restart your device</span>
</Accordion.Header>
        <Accordion.Body>
          <p>Turn off your device, wait a few seconds, then turn it back on.</p>
		<p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check the volume settings</span> {/* FN GUIDE  */}
</Accordion.Header>
        <Accordion.Body>
         <p> Ensure that the volume on your device is turned up. </p>
		 

		 <p> ( Fn + Volume generally) </p>
		   <img src={fnImg} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
		 <p>If the malfunction persists, please perform the next step. </p>
		  
		  
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	   <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check the mute mode</span>{/* mute guide  */}
</Accordion.Header>
        <Accordion.Body>
         <p>  Make sure your device is not in silent mode. </p>
		 
		  <p> ( Fn + Mute generally) </p>
		 <img src={mtImg} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
		 <p>  If the malfunction persists, please perform the next step. </p>
		 
        </Accordion.Body>
      </Accordion.Item>
	  
	    <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Verify the headphone connection</span>{/* Headphone COnn  */}
</Accordion.Header>
        <Accordion.Body>
         <p>  Check that there are no headphones connected to the 3.5 jack or a Bluetooth audio device connected but not accessible. </p>
		 
		  <p> If the malfunction persists, please perform the next step.</p>
		 
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Check with different media</span>{/* Check media */}
</Accordion.Header>
        <Accordion.Body>
         <p>  Try playing different type of media for example music, videos to see if the issue is specific to certain applications or type of audio. </p>
		 
		  <p> If the malfunction persists, please perform the next step.</p>
		 
        </Accordion.Body>
      </Accordion.Item>
	  
	  	  <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>{/* Check media */}
</Accordion.Header>
        <Accordion.Body>
         <p> Open the device manager to check to check that the driver is correctly installed.  </p>
		 
		  <p> Launch Windows update to install the latest drivers and updates for Windows.</p>
		 <p>If the malfunction persists, please perform the next step.</p>

		 
        </Accordion.Body>
      </Accordion.Item>
	  
	  	  <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">If the sound still doesn't work, the device must be serviced by an approved repair center</span>{/* Check media */}
</Accordion.Header>
        <Accordion.Body>
         <p> Create an RMA number so that the device can be picked up at a repair center</p>
		 
		  <p>Create a new Request in this website</p>
		 

		 
        </Accordion.Body>
      </Accordion.Item>
	  
    </>
  )}

  {guide.id === 1 && (//GUIDE ID  1 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>
      <Accordion.Item eventKey="8">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="9">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another speaker</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the speaker with the malfunction, then temporarily connect another speaker. </p>
		    <p>If the speaker works, please replace it. </p>
			<p>Replace the IO Board </p>
			 <p>If the speaker works, please replace it. </p>
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  HOW DO I REPLACE THE SPEAKERS?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_33fd05549e52438181b5f6324178aed6/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>
    </>
	
  )}
  
  
 
  
  {/*CAMERAISSUE SECTION lvl1 */}
  
  {guide.id === 2 && (//GUIDE ID 2 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Try to restart your device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds, then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check camera is enable</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that the camera is enable with function key (if available).</p>
		   
		   <img src={camimg} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
		    <p>Go to "Settings", "Privacy", "Camera" and make sure that the camera access is enabled.. </p>
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check the applications permissions</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that the application has the necessary permissions to access the camera.</p>
		   
		  
		    <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		   
		  
		    <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
			
			 <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">If the camera still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*CAMERAISSUE SECTION lvl2 */}
  
  {guide.id === 2 && (//GUIDE ID  2 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another camera</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the camera with the malfunction, temporarily connect another camera.  </p>
		    <p>If the camera works, please replace it. </p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="9">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another camera</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the camera with the malfunction, temporarily connect another camera.  </p>
		    <p>If the camera works, please replace it. </p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  HOW DO I REPLACE THE CAMERA?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_3e5e48d9d67c497ba05703fb2ef8ce9e/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>
    </>
	
  )}
  
	  
	  
	   {/*Device can't connect to Bluetooth lv1 */}
{guide.id === 3 && (//GUIDE ID 3 LVL 1 AND 2
  <>
    <p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
      Level 1
    </p>
	  
    <Accordion defaultActiveKey={null}>{/* <-- Missing wrapper */}
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <span className="font-bold">Restart Bluetooth</span>
        </Accordion.Header>
        <Accordion.Body>
          <p>Turn off the Bluetooth on your device, wait a few seconds and turn it back on.</p>
          
		  
		  <p>Similarly, restart bluetooth on the device your are trying to connect to.</p>
		  <p>If the malfunction persists, please perform the next step.</p>
		  
		  
		  
		  
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
          <span className="font-bold">Verify that the Bluetooth is activate</span>
        </Accordion.Header>
        <Accordion.Body>
          <p>Make sure that Bluetooth is turned on both on your device and the device you are trying to connect to.</p>
		  <p>Check if the device is set to airplane mode, as this can disable all wireless connection.</p>
          <p>(Fn + Volume generally)</p>
          <img src={btimg} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
          <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
    
	
	
	
      <Accordion.Item eventKey="3">
	  
        <Accordion.Header>
          <span className="font-bold">Try forget and reconnect the Bluetooth</span>
        </Accordion.Header>
        <Accordion.Body>
          <p>On your device, forget the Bluetooth device, then attempt to reconnect by pairing again.</p>
		  <p>If the malfunction persists, please perform the next step.</p>
          
        </Accordion.Body>
      </Accordion.Item>
	
	   <Accordion.Item eventKey="4">
        <Accordion.Header>
          <span className="font-bold">Check the drivers and windows update</span>
        </Accordion.Header>
        <Accordion.Body>
          <p>Open the device manager to check to check that the driver is correctly installed. </p>
		  <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
		   <p>If the malfunction persists, please perform the next step.</p>
          
        </Accordion.Body>
      </Accordion.Item>
   
   
    <Accordion.Item eventKey="5">
        <Accordion.Header>
          <span className="font-bold">If the bluetooth still doesn't work, the device must be serviced by an approved repair center.</span>
        </Accordion.Header>
        <Accordion.Body>
          <p>OCreate an RMA number so that the device can be picked up at a repair center </p>
		 
        </Accordion.Body>
      </Accordion.Item>
   
 
  </Accordion> 
  














    {/*CAMERAISSUE SECTION lvl2 */}
  
  {guide.id === 3 && (//GUIDE ID  2 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">PPerform a test with other Bluetooth device </span>
</Accordion.Header>
        <Accordion.Body>
           <p>Try with other Bluetooth device if possible, to find out whether the problem is with the PC or the receiver like a usb one</p>
		   
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="9">
        <Accordion.Header>
  <span className="font-bold">Test with another MB</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Test with another motherboard, if the Bluetooth module is soldered into the MB.</p>
		    <p>if the Bluetooth/WIFI module is not soldered into the MB please replace the WIFI/BT Module </p>	
			
        </Accordion.Body>
      </Accordion.Item>
	  

	  
    </>
	
  )}
  
  
  
  
  
  
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
  </>
)}
  
 {/*Device doesn't start up correctlylvl1 */}
  
  {guide.id === 4 && (//GUIDE ID 4 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Restart the device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds and then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
		   
		  
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	
	  
	  
	  	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">If the device still doesn't work, the device must be serviced by an approved repair center</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Microphone doesn't work*/}
  
  {guide.id === 4 && (//GUIDE ID  4 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Perform a test with a bootable USB</span>
</Accordion.Header>
        <Accordion.Body>
           <p>With a bootable USB drive with a diagnostic, try booting from the USB to see if the issue persists.</p>
		   
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another camera</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the camera with the malfunction, temporarily connect another camera.  </p>
		    <p>If the camera works, please replace it. </p>
			
        </Accordion.Body>
      </Accordion.Item>

    </>
	
  )}


{guide.id === 5 && (//GUIDE ID 5 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Restart the device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds and then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check microphone is enable</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that the microphone is turn on with Fn key .</p>
		   
		   <img src={micimg} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
			
			<p>In Windows, go to "Settings", "Privacy", "Microphone" and make sure that the microphone access is enabled.

Verify that the microphone is selected as the imput device in your's device settings.</p>
			<p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	
	  
	  
	  	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check the microphone connection</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Check that there are no wireless microphone (BT) connected that are not accessible.</p>
			<p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
	    
	  	  <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Check the audio drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
			<p>Launch Windows update to install the latest drivers and updates for Windows.</p>
			<p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">
If the microphone still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
		
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Microphone doesn't work*/}
  
  {guide.id === 5 && (//GUIDE ID  5 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Perform a test with a bootable USB</span>
</Accordion.Header>
        <Accordion.Body>
           <p>With a bootable USB drive with a diagnostic, try booting from the USB to see if the issue persists.</p>
		   
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another microphone</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the microphone with the malfunction, then temporarily connect another microphone.  </p>
		    <p>If the microphone works, please replace it.</p>
			
        </Accordion.Body>
      </Accordion.Item>


	  
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  HOW DO I REPLACE THE MICROPHONE??
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
src="https://video.wixstatic.com/video/57cb89_33fd05549e52438181b5f6324178aed6/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>







    </>
	
  )}


{/*Screen doesn't work lvl1 */}
  
  {guide.id === 6 && (//GUIDE ID 6 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Try to restart your device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds, then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">If the screen still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up by a repair center.</p>
		 
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  

	  
    </>
  )}
  
 
  
  
   {/*Screen doesn't work lvl2 */}
  
  {guide.id === 6 && (//GUIDE ID  6 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another screen</span>
</Accordion.Header>
        <Accordion.Body>
           <p>First, disconnect only the screen with the malfunction, then temporarily connect another screen.</p>
		    <p>If the screen works, please replace it.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
 
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  HOW DO I REPLACE THE CAMERA?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_3e5e48d9d67c497ba05703fb2ef8ce9e/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>






    </>
	
  )}



{/*Touchpad doesn't work lvl1 */}
  
  {guide.id === 7 && (//GUIDE ID 7 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Check that the touchpad is enabled</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Use the Fn key dedicated to the touchpad activation </p>
		    <div className="flex space-x-4">
	<img src={fn2} alt="Function key 1" className="w-auto max-w-sm rounded" />
	<img src={fnesc} alt="Function key 2" className="w-auto max-w-sm rounded" />
	</div>
		   
		   
		     <p>(Generaly Fn + F2, Fn + ESC ...)</p>
			  <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">If the screen still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up by a repair center.</p>
		 
			
        </Accordion.Body>
      </Accordion.Item>
	  
      <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		
			  <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
			  <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>	  

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">If the touchpad still doesn't work, the device must be serviced by an approved repair center.</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		
			  <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>	 
	  
    </>
  )}
  
 
  
  
   {/*Touchpad doesn't worklvl2 */}
  
  {guide.id === 7 && (//GUIDE ID  7 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another touchpad</span>
</Accordion.Header>
        <Accordion.Body>
           <p>First, disconnect only the touchpad with the malfunction, then temporarily connect another touchpad. </p>
		    <p>Please check with another fpc cable</p>
		    <p>If the touchpad works, please replace it.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
 
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  HOW DO I REPLACE THE TOUCHPAD?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/297b7b_984d5c30f141428ab6e41d7c8d4f0714/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>






    </>
	
  )}



  
  {/*Keyboard doesn't work  LV 1 */}
  
  {guide.id === 8 && (//GUIDE ID 8 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Verify that Num Lock function is enable</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>If  you can't enter numeric values using the numeric keypad, check that the Num Lock key is enable.</p>
		     <p>If the PC doesn't have a numeric keypad and numeric values instead of characters, check that the Num Lock key is disable.</p>
			 <img src={nlk} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
			<p>(Num Lk generally)</p>
				<p>If the malfunction persists, please perform the next step.</p>

        </Accordion.Body>
      </Accordion.Item>




      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Verify characters entered</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Check that the values entered are those expected by the system.</p>
		   
		   
		    <p>The PIN code used to open a Windows session is a numeric value. 

If the user enters the characters of his password, no value is entered on the interface.</p>
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">If the keyboard still doesn't work, the device must be serviced by an approved repair center</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
		   
		  
		
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	 
	  
	  
    </>
  )}
  
 
  
  
   {/*Keyboard doesn't worklvl2 */}
  
  {guide.id === 8 && (//GUIDE ID  8 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another keyboard</span>
</Accordion.Header>
        <Accordion.Body>
           
		    <p>If the keyboard works, please replace it.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	
	  
	  
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
HOW DO I REPLACE THE KEYBOARD?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_d471559581164ed69ed8f171fc1918a7/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>
    </>
	
  )}



 
  
  {/*Device can't connect to Wi-Fi or a network */}
  
  {guide.id === 9 && (//GUIDE ID 9 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Try to restart your device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds, then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check Wi-Fi settings</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that Wi-Fi is enabled on your device and airplane mode is off.</p>
		   
		   <img src={plane} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
		    <p>Go to "Settings", "Privacy", "Camera" and make sure that the camera access is enabled.. </p>
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Try forget and reconnect the Wi-Fi</span>
	</Accordion.Header>
        <Accordion.Body>
           <p>On your device, forget the Wi-Fi network, then try to reconnect.</p>
		   
		  
		    <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Examine Internet box/repeater for Wi-Fi Issue</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		   
		  
		    <p>Evaluate compatibility of PC with 2.4 GHz and 5 GHz networks.</p>
			
			 <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
	<p>Launch Windows update to install the latest drivers and updates for Windows.</p>
		<p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>
	  
	    	  <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">If the Wi-Fi still doesn't work, the device must be serviced by an approved repair centre.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Device can't connect to Wi-Fi or a network */}
  
  {guide.id === 9 && (//GUIDE ID  9 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="8">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another Wi-Fi antenna</span>
</Accordion.Header>
        <Accordion.Body>
           <p>First, disconnect the wifi antenna with the malfunction, then temporarily connect another wifi antenna.  </p>
		    <p>If the wifi works, please replace the antenna. </p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="9">
        <Accordion.Header>
  <span className="font-bold">Test with another MB</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If  Wi-Fi module soldered, test another motherboard. </p>
		   
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
 HOW DO I REPLACE THE WI-FI ANTENNA?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_761b75b1bf06484e918c8d1ded2d8f3c/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>
    </>
	
  )}


  {/*Device doesn't switch on lvl1 */}
  
  {guide.id === 10 && (//GUIDE ID 2 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Verify the power source </span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Inspect power cables and connectors for any damage.</p>
		     <p>Ensure that the device is properly connected to a power source.</p>
			  <p>Ensure that the device is properly connected to a power source.</p>
			  <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check charge indicator power led </span>
</Accordion.Header>
        <Accordion.Body>
           <p>If the charge indicator is present, press  and hold the power button for an extended period to see if the device responds (usually 10-15 seconds).</p>
		   
		   
		    <p>If the charge indicator is not present, test another charger  and let the device charge 10-15 minutes and try to switch on the device.	</p>
			 <p>If the charge indicator lights up with a different charger and the unit then lights up, it's a charger replacement.	</p>
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  <Accordion.Item eventKey="2">
        <Accordion.Header>
  <span className="font-bold">If the camera still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Device doesn't switch on lvl2 */}
  
  {guide.id === 10 && (//GUIDE ID  2 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Attempt to switch on the PC with the charger, battery, MB disconnected, lcd LVDS </span>
</Accordion.Header>
        <Accordion.Body>
           <p>If the PC turn on, the problem is one of the disconnected components.
Reconnect them one by one and try to turn on the device to identify the faulty component.</p>
		    <p>If the PC lights up but no display, test another LCD and LVDS cable</p>
			 <p>If the PC still doesn't switch on, test another KBC (keyboard).</p>
			 <p> If still no response from the device, test another MB (motherboard).</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  

    </>
	
  )}
  



  
  {/*Device doesn't recharge. Battery life is limited lvl1 */}
  
  {guide.id === 11 && (//GUIDE ID 11 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Verify the power source</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Inspect power cables and connectors for any damage. </p>
		     <p>Ensure that the device is properly connected to a power source.</p>
			 <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check charge indicator</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If the charge indicator is present, press  and hold the power button for an extended period to see if the device responds (usually 10-15 seconds)..</p>
		   

		    <p>If the charge indicator is not present, test another charger  and let the device charge 10-15 minutes and try to switch on the device.
			   If the charge indicator lights up with a different charger and the unit then lights up, it's a charger replacement. </p>
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  	  <Accordion.Item eventKey="2">
        <Accordion.Header>
  <span className="font-bold">If the battery still doesn't charge, the device must be serviced by an approved repair centre..</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Device doesn't recharge. Battery life is limited lvl2 */}
  
  {guide.id === 11 && (//GUIDE ID  11 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Perform a test with another battery</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Disconnect the battery with malfunction, temporarily connect another battery.</p>
		    <p>If it discharge too quickly (10% 5-10 minutes), please replace it. </p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	    	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
HOW DO I REPLACE THE BATTERY?
    <video
   className="mx-auto mt-4 max-w-xl w-full h-auto"
  controls
  src="https://video.wixstatic.com/video/57cb89_0247241f46bb4c6dadb9709a2bbac57a/1080p/mp4/file.mp4"
  type="video/mp4"
>
  Your browser does not support the video tag.
</video>
</p>
    </>
	
  )}
  
	  
{/*Device turns off unexpectedlylvl1 */}
  
  {guide.id === 12 && (//GUIDE ID 12 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Verify the battery level	</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that your device has sufficient battery charge.</p>
		     <p>Charge the device and see if the problem persists.</p>
			 <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check the app issues</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Check if an application is causing the device to shut down unexpectedly.</p>
		   
		  
		    <p>If so, try updating the app or uninstalling and reinstalling it..</p>
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check that the cause is not an overheated unit</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Check if your device  feels excissevely hot when it turns off.</p>
		 
			<p>If overheating is a recurrent issue, it could be due to a malfunctioning cooling system or a heavy processing load.</p>
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		   
		  
		    <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
			
			 <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">If the device still doesn't work, the device must be serviced by an approved repair center</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Device turns off unexpectedly lvl2 */}
  
  {guide.id === 12 && (//GUIDE ID  12 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>
  <span className="font-bold">Determinte device stability</span>
</Accordion.Header>
        <Accordion.Body>
           <p>First, switch on the device with the charger connected and leave running for 1 to 2 minutes. </p>
		    <p>hen disconnect the charger to see if the device switches off. </p>
			
			<p>If it goes out, the battery may be faulty.</p>
			<p>If it doesn' t shut down, reinstall the OS and run a stress test</p>
			<p>If the problem persists, test another KBC.</p>
			<p>If the problem is still unresolved, test another MB.</p>	
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	   
    </>
	
  )}

 {/*Windows doesn't activate lvl1 */}
  
  {guide.id === 13 && (//GUIDE ID 13 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Check the internet connection</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Ensure that your device is connected to the internet. Activation oftens requires an internet connection to verify the license.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Check the activation troubleshooter</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Go to "Settings", "Update & Security", "Activation, then select "Troubleshoot".

Follow the on-screen instructions to resolve activation issues..</p>
		  
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Follow the procedure to activate Windows</span>
</Accordion.Header>
        <Accordion.Body>
     	    <p>For Windows in S-Mode, disable mandatory driver signature verification.</p>
 <p>&nbsp;</p>
	
			   <p>Click on the "Start" menu and use your keyboard to type "Advanced startup" and click on "Modify advanced startup options". Then select "Restart now".</p>
			 <p>&nbsp;</p>
			 <p>In the menu, select "Troubkeshooting", "Advanced options", "Settings" then"Restart".</p>	
			 <p>&nbsp;</p>
			<p>In the startup parameters menu, select "7 Disable mandatory driver signature check" using the "F7" key.</p>	
			 <p>&nbsp;</p>
			<p>For Windows without S mode, open the command prompt in administrator mode.</p>	
			<p>&nbsp;</p>
			<p>Click on the "Start" menu and enter "cmd" using the keyboard. The following Windows appears: right-click on the "Command prompt" application and select "Run as administrator".</p>	
			<p>&nbsp;</p>
			<p>Retrieve the activation key by entering</p>	
			<code className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
		slmgr /xpr
		</code>
			
			<p>and press "Enter" This message appears "</p>
			<code className="bg-gray-200 text-gray-800 px-0 py-1 rounded">
		wmic path softwarelicensingservice get OA3xOriginalProductKey
		</code>
		<p>then press "Enter" again."</p>	
		<p>&nbsp;</p>
		<p>The Windows key for your device is displayed. It consists of 5 series of 5 characters.</p>
		<p>&nbsp;</p>
		<p>If no key is displayed at this stage, please contact Thomson Computing customer service, who will issue you with a new Windows key.
		Select the key displayed with your mouse and copy it by simultaneously pressing the "CTRL" key and the "C" key.</p>
		<p>&nbsp;</p>
		<p>Install the activation key by entering "slui 3" and pressing "Enter".
		A window appears. 
		In the product key entry form, right-click and select "Paste". Press the "Next" button, then "Activate". Windows is now activated.</p>	
			<p>&nbsp;</p>
			<p>If Windows still doesn't activate, enter the following command "slui 4" and press "Enter".
			Select your country from the list and follow the instructions to contact a Microsoft operator, who will finalize activation over the phone.</p>
			
		
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  
    </>
  )}
  
 
  
   
 
  
  {/*Windows runs abnormally lvl1 */}
  
  {guide.id === 14 && (//GUIDE ID 14 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Try to restart your device</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Turn off your device, wait a few seconds, then turn it back on.</p>
		     <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Try to free up disk space</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Delete unnecessary files to free up space.Go to "Settings", "Applications" and unistall programs you no longer need.</p>
		
			
			<p>If the malfunction persists, please perform the next step.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  <Accordion.Item eventKey="2">
        <Accordion.Header>
  <span className="font-bold">Check the drivers and windows update</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Open the device manager to check to check that the driver is correctly installed. </p>
		   
		  
		    <p>Launch Windows update to install the latest drivers and updates for Windows.</p>
			
			 <p>If the malfunction persists, please perform the next step.</p>
			
			
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">If the camera still doesn't work, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Windows runs abnormally lvl 2 */}
  
  {guide.id === 14 && (//GUIDE ID  14 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Perform the test using  with another HDD/SSD</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If it not solve the issue , test with another MB. </p>
		    <p>If HDD/SSD works, please change it. </p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	     <Accordion.Item eventKey="6">
        <Accordion.Header>
  <span className="font-bold">Perform with another MB</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If it not solve the issue , test with another SSD with a windows fresh install.</p>
		    <p>If motherboard works, pleace replace it.</p>
			
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
    </>
	
  )}


 
  {/*Blocking on shell lvl1 */}
  
  {guide.id === 15 && (//GUIDE ID 15 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Check boot options in BIOS</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Check boot options in BIOS ,Go to the Bios, the "Boot" tab and check in "Boot option priorities" whether "Windows boot manager" is first in the list.</p>
		     <p>If not, put it first and press "Save and exit".</p>
			 <p>If the malfunction persists, please perform the next step.</p>
        </Accordion.Body>
      </Accordion.Item>

 
	  
	  	  <Accordion.Item eventKey="2">
        <Accordion.Header>
  <span className="font-bold">If the boot issue on shell block persists, the device must be serviced by an approved repair center.</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Create an RMA number so that the device can be picked up at a repair center</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
    </>
  )}
  
 
  
  
   {/*Blocking on shell lvl2 */}
  
  {guide.id === 15 && (//GUIDE ID  15 LVL 2
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 2
</p>

      <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Perform the level 1 steps</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Perform level 1 steps to check that the malfunction is persistent</p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Reinstall OS</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If this doesn't work, test another SSD.</p>
		    <p>If it still doesn't work, test another motherboard. </p>
			<p>Restore Bios default settings and check the boot order </p>
			
        </Accordion.Body>
      </Accordion.Item>

    </>
	
  )}

 
  {/*Password not working  1 */}
  
  {guide.id === 16 && (//GUIDE ID 16 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  Level 1
</p>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
  <span className="font-bold">Retype the password</span> {/* LVL step */}
</Accordion.Header>
        <Accordion.Body>
           <p>Retype the password (a simple typographical error can be the cause of loging issues)</p>
		     <p>If the malfunction persists, please perform the next step.</p>
	
        </Accordion.Body>
      </Accordion.Item>

 
	  
	  	  <Accordion.Item eventKey="2">
        <Accordion.Header>
  <span className="font-bold">Verify the e-mail</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Make sur you are entering the correct e-mail associated with your account.</p>
		   <p>If the malfunction persists, please perform the next step.</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	   	  <Accordion.Item eventKey="3">
        <Accordion.Header>
  <span className="font-bold">Check the caps lock or num lock</span>
</Accordion.Header>
        <Accordion.Body>
           <p>Check whether it's a password or a confidential code (passwords included all characters confidential codes can only contain numbers.</p>
		   <p>Check if the caps lock or num lock key are accidentally turned on or off.</p>
		    <img src={nlk} alt="Function key" className="w-auto max-w-sm mb-3 rounded" />
			<p>(Num Lk generally)</p>
				<p>If the malfunction persists, please perform the next step.</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	   	  <Accordion.Item eventKey="4">
        <Accordion.Header>
  <span className="font-bold">Reset your password</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If you have the option for password resetting, use it.</p>
		   <p>If the malfunction persists, please perform the next step.</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	   	  <Accordion.Item eventKey="5">
        <Accordion.Header>
  <span className="font-bold">Check if the account is not locked</span>
</Accordion.Header>
        <Accordion.Body>
           <p>If you've entered the password incorrectly multiple times, your account might be locked.</p>
		   <p>Check for any account lockout message or contact the system administrator or service provider for assistance.</p>
	
        </Accordion.Body>
      </Accordion.Item>
	  
	  
	  
	  
    </>
  )}


 {/*TOUCHPAD FIRMWARE UPDATE  lvl1 */}
  
  {guide.id === 17 && (//GUIDE ID 17 LVL 1
    <>
	<p className="text-xl font-bold text-blue-600 text-center max-w-3xl mx-auto">
  TOUCHPAD FIRMWARE UPDATE
 
</p>
<p className="text-xl font-bold text-blue-600 text-left0 max-w-3xl mx-auto">
 Devices concerned
 
</p>

<p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• (XX)N15I310-8GR256

</p>
 <p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• (XX)N15I510-16GR512

</p>
<p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• TH15I510-16SL512

</p>
<p className="text-xl font-bold text-blue-600 text-left0 max-w-3xl mx-auto">
WHOSE SERIAL NUMBER BEGINS WITH: 

</p>
<p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• SH1589xxxxxxxxx

</p>
<p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• SH1621xxxxxxxxx

</p>
<p className="text-x0 font-bold text-blac-400 text-left0 max-w-2xl mx-auto">
• SH1622xxxxxxxxx

</p>        
           
	  
	  
	  
	  
	  
      <Accordion.Item eventKey="1">
        <Accordion.Header>
  <span className="font-bold">Updating method:</span>
</Accordion.Header>
        <Accordion.Body>
           <p>1. Download the touchpad update application by using the download button</p>
		   <p>2. Copy the zip file to desktop (laptop), then unzip</p>
		   <p>3. Run the touchpad_update.exe app.</p>
		   <p>4. Click the UPDATE option, the touchpad driver will be updated.</p>
		   <p>5. Once update process completed, the ‘version’ item will be displayed as ‘0004’</p>
		   <p>6. Reboot the laptop.</p>
		
		 <div className="flex justify-end">
  <a
    href="http://gofile.me/5wnJP/WgsCE7qRn"
    download
    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
  >
    Download Guide
  </a>
</div>

		 
		 
        </Accordion.Body>
      </Accordion.Item>
	 
	  
    </>
  )}
  




{/* Add more accordion groups for other IDs as needed */}
</Accordion>

                  </div>	
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Your existing Quick Help accordion and other content below... */}

        {/* Quick Help Accordion */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
        

        
        </div>
      </div>
    </div>
  );
}