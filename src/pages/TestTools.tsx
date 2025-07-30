import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Check, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import Home from "@/assets/wtpth/Home.jpg";
import maininf from "@/assets/wtpth/maininf.jpg";
import final from "@/assets/wtpth/final.jpg";
import tp from "@/assets/wtpth/tp.jpg";
import kbc from "@/assets/wtpth/kbc.jpg";
import Serial from "@/assets/wtpth/Serial.jpg";
import sound from "@/assets/wtpth/sound.jpg";
import Panel from "@/assets/wtpth/panel.jpg"
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";





export default function TestTools() {
  // Use the auth context hook at the component level, not within a callback
  const { isAuthenticated } = useAuth();

  const featuredTool = {
    name: "WTPTH",
    version: "2.5.1",
    description: "Windows Test Powered Tool for Hardware (WTPTH) is a comprehensive diagnostic tool that tests all major hardware components of your computer.",
    features: [
      "Computer specifications check ",
      "RAM capacity",
      "Storage check",
      "Keyboard test",
      "Network connection testing and speed measurement",
      "System information gathering and reporting"
    ],
    screenshots: [
    { title: "Main Window", path: Home },
	  { title: "Serial Replace", path: Serial },
    { title: "Computer Info", path: maininf },
	  { title: "Keyboard Test", path: kbc },
	    { title: "Speakers test", path: sound },
	 { title: "Touchpad Test", path: tp },
    { title: "Final Results", path: final }
    ],
    systemRequirements: {
      os: "Windows 10/11 (64-bit)",
      cpu: "Any modern dual-core processor",
      ram: "2 GB minimum, 4 GB recommended",
      storage: "200 MB free space",
      other: "Administrator privileges required"
    },
    downloadLink: "https://drive.google.com/file/d/1bEBVk9Wgd9DK9xHH_Kwy_vCBbmH7frLg/view?usp=sharing"
  };





  const otherTools = [
    {
      name: "Memtest86",
      version: "11,3	",
      description: "Advanced memory testing tool to identify RAM issues and instabilities.",
      category: "Hardware",
      os: ["windows10", "windows11"],
      size: "15 MB",
      link: "https://www.memtest86.com/downloads/memtest86-usb.zip"
    },
    {
      name: "CrystalDiskMark ",
      version: "9.0.1",
      description: "Hard drive and SSD diagnostic tool that monitors health, performs read/write tests, and predicts failures.",
      category: "Storage",
      os: ["windows10", "windows11"],
      size: "28 MB",	
      link: "https://crystalmark.info/redirect.php?product=CrystalDiskMark"
    },
    {
      name: "NetworkAnalyzer",
      version: "12.8",
      description: "Network diagnostic utility that tests connection speed, latency, and identifies connectivity issues.",
      category: "Network",
      os: ["windows10", "windows11"],
      size: "257 MB",
      link: "https://www.manageengine.com/products/netflow/2028821/ManageEngine_NetFlowAnalyzer_64bit.exe"
    },
    {
      name: "Core Temp",
      version: "1.18.1",
      description: "Temperature monitoring tool that tracks CPU, GPU, and other component temperatures over time.",
      category: "Hardware",
      os: ["windows10"],
      size: "18 MB",
      link: "https://www.alcpu.com/CoreTemp/Core-Temp-setup-v1.18.1.0.exe"
    },
    {
      name: "BatteryInfoView ",
      version: "1.26",
      description: "Laptop battery tool that check capacity, discharge rate, and estimates remaining battery life.",
      category: "Hardware",
      os: ["windows10", "windows11"],
      size: "12 MB",
      link: "https://www.nirsoft.net/utils/batteryinfoview-x64.zip"
    }
  ];

  const usageGuides = [
    {
      title: "How to run a full system diagnostic",
      steps: [
        "Download and install WTPTH from the download link below",
        "Launch the application with administrator privileges",
        "Click 'Start ' and add the RMA and wait for the load",
        "Run each different test ",
		"You can export the test results to PDF file",
		
      ]
    },
   
    {
      title: "Understanding test results",
      steps: [
        "Green checkmarks indicate passed tests with no issues detected",
        "Orange alerts indicate critical issues that need immediate attention",
        "Please check for every Orange alert for a Software or Hardware issue like a Keyboard faulty key",
        "Use the 'Export Report' button to save a copy of the results for future reference"
      ]
    }
  ];

  return (
    
	   <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <div className="relative rounded overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
            <img 
              src={Panel} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="relative z-10 px-6 py-20">
            <h1 className="text-4xl font-bold text-white mb-0">
              Testing Tool and Diagnostics
              <p className="text-xl text-blue-50 mb-10 max-w-2xl text-center mx-auto drop-shadow">
                Professional diagnostic tools to test and verify your computer's hardware and performance
              </p>
            </h1>
          </div>
        </div>
      </div>

      {/* Featured Tool Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-sm border">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
            <div>
              <Badge variant="outline" className="mb-4">Featured Tool</Badge>
              <h2 className="text-3xl font-bold mb-2">{featuredTool.name}</h2>
              <p className="text-gray-600">Version {featuredTool.version}</p>
            </div>
            <div className="mt-4 md:mt-0">
              {isAuthenticated ? (
                // User is logged in, show download button
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <a href={featuredTool.downloadLink} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                  </a>
                </Button>
              ) : (
                // User is not logged in, show login message
                <Button asChild size="lg" className="bg-gray-400 hover:bg-gray-500">
                  <Link to="/login" className="flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Login to Download
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
              <TabsTrigger value="requirements">System Requirements</TabsTrigger>
              <TabsTrigger value="guides">Usage Guides</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">About {featuredTool.name}</h3>
                  <p className="text-gray-700 mb-6">
                    {featuredTool.description}
                  </p>
                  <p className="text-gray-700">
                    Our comprehensive testing utility helps you identify hardware issues before they cause system failures.
                    Regular testing with WTPTH can help extend the life of your computer by catching problems early.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-600" />
                    Quick Facts
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Tests all critical hardware components</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Generates detailed reports .pdf</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Quick tests and diagnostics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Regular updates to support new hardware</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Mainboard Serial Number Replace 	</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="features" className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredTool.features.map((feature, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="text-gray-700">{feature}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="screenshots" className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Screenshots</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredTool.screenshots.map((screenshot, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg overflow-hidden border">
                    <div key={index} className="bg-gray-100 rounded-lg overflow-hidden border">
					<div className="aspect-video bg-gray-200 overflow-hidden">
						<img
						src={screenshot.path}
							alt={screenshot.title}
						className="object-cover w-full h-full"
					/>
						</div>
					</div>

                    <div className="p-4 bg-white">
                      <h4 className="font-medium">{screenshot.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="requirements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Requirements</CardTitle>
                  <CardDescription>Minimum specifications to run WTPTH</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b">
                      <div className="font-medium">Operating System</div>
                      <div className="md:col-span-2 text-gray-600">{featuredTool.systemRequirements.os}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b">
                      <div className="font-medium">Processor</div>
                      <div className="md:col-span-2 text-gray-600">{featuredTool.systemRequirements.cpu}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b">
                      <div className="font-medium">Memory</div>
                      <div className="md:col-span-2 text-gray-600">{featuredTool.systemRequirements.ram}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b">
                      <div className="font-medium">Storage</div>
                      <div className="md:col-span-2 text-gray-600">{featuredTool.systemRequirements.storage}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="font-medium">Other</div>
                      <div className="md:col-span-2 text-gray-600">{featuredTool.systemRequirements.other}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="guides" className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Usage Guides</h3>
              <Accordion type="single" collapsible className="w-full">
                {usageGuides.map((guide, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{guide.title}</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 pl-4">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className={step.includes("Red alerts") ? "dark:text-amber-300 text-gray-600" : "text-gray-600"}>{step}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Other Tools Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Other Testing Utilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherTools.map((tool, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>Version {tool.version}</CardDescription>
                  </div>
               <Badge
  variant="outline"
  className="text-blue-700 border-blue-700"
>
  {tool.category}
</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Size: {tool.size}
                  </div>
                  <div className="flex space-x-1">
                    {tool.os.includes("windows10") && (
             <Badge
  className="text-xs bg-blue-100 text-blue-800 pointer-events-none"
>
  Win 10
</Badge>
                    )}
                    {tool.os.includes("windows11") && (
                      <Badge
  className="text-xs bg-blue-100 text-blue-800 pointer-events-none"
>
  Win 11
</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                 <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <a href={tool.link} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

     

      {/* Support Section */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="max-w-3xl mx-auto">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Need Help with Testing?</h3>
          <p className="text-gray-600 mb-6">
            If you're experiencing issues with our testing tools or need assistance interpreting test results,
            our technical support team is ready to help.
          </p>
          <Button asChild>
            <a href="/requests">Get Technical Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}