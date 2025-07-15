import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, CheckCircle2, AlertTriangle, Laptop } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Panel from "@/assets/wtpth/panel.jpg"
export default function Windows11() {
  const isoDownloads = [
    {
      name: "Windows 11 Home + Office 365",
      version: "24H2",
      size: "22 GB",
      link: "http://gofile.me/5wnJP/iR1i1ILRr"
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

  const requirements = [
    { name: "Processor", spec: "1 GHz or faster with 2 or more cores" },
    { name: "RAM", spec: "4 GB or greater" },
    { name: "Storage", spec: "64 GB or greater storage device" },
    { name: "System firmware", spec: "UEFI, Secure Boot capable" },
    { name: "TPM", spec: "Trusted Platform Module (TPM) version 2.0" },
    { name: "Graphics card", spec: "DirectX 12 compatible graphics / WDDM 2.0 driver" },
    { name: "Display", spec: "9\" with HD resolution (720p)" }
  ];

  const faqs = [
    {
      question: "Can I upgrade my Windows 10 PC to Windows 11?",
      answer: "You can upgrade to Windows 11 if your PC meets the minimum system requirements. Microsoft provides the PC Health Check app to verify compatibility."
    },
    {
      question: "Is Windows 11 free?",
      answer: "Windows 11 is free to upgrade from Windows 10 if you have a valid Windows 10 license and your PC meets the system requirements."
    },
    {
      question: "What are the main features of Windows 11?",
      answer: "Windows 11 includes a redesigned interface with a centered Start menu, improved performance, better virtual desktop support, Microsoft Teams integration, and enhanced gaming features with DirectX 12 Ultimate and Auto HDR."
    },
    {
      question: "What if my PC doesn't meet the requirements?",
      answer: "If your PC doesn't meet the Windows 11 requirements, you can continue using Windows 10, which will be supported until October 14, 2025. Alternatively, there are unofficial methods to install Windows 11 on unsupported hardware, but these aren't recommended for security and stability reasons."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1
          className="text-4xl font-bold text-white mb-0 px-6 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
        Windows 11
			   <p className="text-xl text-blue-100 mb-8">
       Find everything you need for Windows 11 - from ISO file ,downloads and drivers and support tools.
    </p>
        </h1>
        
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Latest Version</AlertTitle>
        <AlertDescription className="text-blue-700">
          Windows 11 version 24H2 is now available with new features including tabs in File Explorer, improved touch gestures, and enhanced security.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="iso" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="iso">ISO Downloads</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="requirements">System Requirements</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
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
          
          <div className="mt-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 mr-4 mt-1 h-5 w-5" />
              <div>
                <h3 className="text-lg font-medium text-amber-800 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  Before installing Windows 11, please check if your computer meets the minimum system requirements. 
                  You can use the PC Health Check app from Microsoft to verify compatibility.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="drivers" className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Windows 11 Optimized Drivers</h2>
            <p className="text-gray-600 mb-6">
              These drivers are specifically optimized for Windows 11 performance and features.
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
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Driver Update Recommendations</CardTitle>
                <CardDescription>Best practices for updating drivers on Windows 11</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                    <span>Always back up your system before major driver updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                    <span>Update one driver at a time to isolate potential issues</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                    <span>Create a restore point before updating critical drivers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                    <span>Consider using Windows Update for driver updates when possible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="requirements" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Laptop className="mr-2 h-5 w-5" />
                Windows 11 System Requirements
              </CardTitle>
              <CardDescription>
                Check if your computer meets these minimum requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b last:border-0">
                    <div className="font-medium">{req.name}</div>
                    <div className="md:col-span-2 text-gray-600">{req.spec}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                For detailed information, visit the <a href="#" className="text-blue-600 hover:underline">official Windows 11 requirements page</a>.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Still have questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have specific questions about Windows 11 compatibility or installation for your computer,
                  please submit a support request.
                </p>
                <Button asChild>
                  <a href="/requests">Contact Support</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}