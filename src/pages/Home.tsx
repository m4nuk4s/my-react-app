import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Panel from "@/assets/wtpth/panel.jpg";
import logo from "@/assets/wtpth/logo.png";

export default function Home() {
  const serviceCards = [
    {
      title: "Windows Support",
      description: "Drivers and support for Windows 10 & 11",
      link: "/windows",
      icon: "💻"
    },
    {
      title: "Drivers",
      description: "Find and download drivers for your computer model",
      link: "/drivers",
      icon: "🔧"
    },
    {
      title: "Guides",
      description: "Computer repair and troubleshooting guides",
      link: "/guides",
      icon: "ℹ️"
    },
    {
      title: "Disassembly Guides",
      description: "Step-by-step guides for computer disassembly and repair",
      link: "/disassembly-guides",
      icon: "🔍"
    },
    {
      title: "Test Tools",
      description: "Testing utilities for your computer",
      link: "/test-tools",
      icon: "⚙️"
    },
    {
      title: "Support Requests",
      description: "Submit a request for technical support",
      link: "/requests",
      icon: "📝"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-red-100">
      {/* Hero Section */}
     

<section
  className="relative py-20 px-4 sm:px-6 lg:px-8 text-center bg-cover bg-center"
  style={{ backgroundImage: `url(${Panel})` }}
>
  <div className="max-w-5xl mx-auto bg-red/50 p-6 rounded-lg">
    <div className="flex justify-center items-center mb-6 space-x-4">
      <img
        src={logo}
        alt="Tech Support Logo"
        className="h-20 w-20 md:h-24 md:w-24"
      />
      <h1 className="text-4xl md:text-6xl font-extrabold text-white">
        Tech Support Center
      </h1>
    </div>
    <p className="text-xl text-blue-100 mb-8">
      Your one-stop solution for all computer maintenance and support needs
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      {/* your buttons or content */}
    </div>
  </div>
</section>


      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">System Tools , Software</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCards.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to={service.link}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-lg shadow-sm my-8">
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-5xl mb-4 text-blue-600">🛠️</div>
            <h3 className="text-xl font-bold mb-2">Expert Support</h3>
            <p className="text-gray-600">Professional tech support for all your computer needs</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4 text-blue-600">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast Solutions</h3>
            <p className="text-gray-600">Quick and reliable solutions to get you back on track</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4 text-blue-600">📱</div>
            <h3 className="text-xl font-bold mb-2">Comprehensive Resources</h3>
            <p className="text-gray-600">All the tools, drivers and guides in one place</p>
          </div>
        </div>
      </section>
    </div>
  );
}