import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Panel from "@/assets/wtpth/panel.jpg"
export default function Windows10() {
  const isoDownloads = [
    {
      name: "Windows 10 Home EDITION + Office 365",
      version: "22H2",
      size: "16.1 GB",
      link: "http://gofile.me/5wnJP/TX70oFXuM"
    },
    {
      name: "WINDOWS 10 Pro + Office 365",
      version: "22H2",
      size: "15 GB",
      link: "http://gofile.me/5wnJP/gz1mviQCe"
    }
  ];

  const essentialDrivers = [
    {
      name: "Coming soon",
      version: "Coming soon",
      date: "Coming soon",
      description: "Coming soon",
      link: "Coming soon"
    },
    {
      name: "Coming soon",
      version: "Coming soon",
      date: "Coming soon",
      description: "Coming soon",
      link: "Coming soon"
    },
    {
      name: "Coming soon",
      version: "Coming soon",
      date: "Coming soon",
      description: "Coming soon",
      link: "Coming soon"
    },
    {
      name: "Coming soon",
      version: "Coming soon",
      date: "Coming soon",
      description: "Coming soon",
      link: "Coming soon"
    }
  ];

  const supportTools = [
    {
      name: "Media Creation Tool",
      description: "Create installation media for Windows 10",
      link: "https://support.microsoft.com/en-us/windows/create-installation-media-for-windows-99a58364-8c02-206f-aa6f-40c3b507420d"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
	  
        <h1
          className="text-4xl font-bold text-white mb-0 px-4 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
          Windows 10
		   <p className="text-xl text-blue-100 mb-8">
       Find everything you need for Windows 10 - from ISO file ,downloads and drivers and support tools.
    </p>
        </h1>
       
	   
		
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>⚠️ Important</AlertTitle>
        <AlertDescription>
          Windows 10 will reach end of support on October 14, 2025. Make sure to plan your upgrade to Windows 11 if your hardware supports it.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="iso" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="iso">ISO Downloads</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="tools">Support Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="iso" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isoDownloads.map((iso, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{iso.name}</CardTitle>
                  <CardDescription>Version: {iso.version}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Size: {iso.size}</p>
                  <Button asChild className="w-full">
                    <a href={iso.link} download>
                      <Download className="mr-2 h-4 w-4" /> Download Windows
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">How to create bootable Windows 10 media</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Download your preferred Windows 10 ISO file</li>
              <li>Download the Media Creation Tool from Microsoft</li>
              <li>Run the Media Creation Tool and select &quot;Create installation media&quot;</li>
              <li>Follow the on-screen instructions to create a bootable USB drive</li>
            </ol>
          </div>
        </TabsContent>
        
        <TabsContent value="drivers" className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Essential Windows 10 Drivers</h2>
            <p className="text-gray-600 mb-6">
              These are the most commonly needed drivers for Windows 10. For specific hardware drivers, please use the search tool on our Drivers page.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {essentialDrivers.map((driver, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{driver.name}</CardTitle>
                  <CardDescription>Version: {driver.version} ({driver.date})</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{driver.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <a href={driver.link} download>
                      <Download className="mr-2 h-4 w-4" /> Download Driver
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportTools.map((tool, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
                  <Button asChild className="w-full">
                    <a href={tool.link} download>
                      <Download className="mr-2 h-4 w-4" /> Download Tool
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Troubleshooting Common Windows 10 Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Windows 10 Update Problems</h4>
                    <p className="text-sm text-gray-600">
                      Run the Windows Update Troubleshooter from Settings &gt; Update &amp; Security &gt; Troubleshoot
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Blue Screen Errors</h4>
                    <p className="text-sm text-gray-600">
                      Update all drivers, run SFC /scannow in Command Prompt, check for hardware issues
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Performance Issues</h4>
                    <p className="text-sm text-gray-600">
                      Disable startup programs, run Disk Cleanup, check for malware, consider adding more RAM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}