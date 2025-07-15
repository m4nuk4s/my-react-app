import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import emailjs from "@emailjs/browser";

import { Button } from "@/components/ui/button";
import Panel from "@/assets/wtpth/panel.jpg";


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Your EmailJS service, template, and user IDs
const SERVICE_ID = "service_3nte2w8";
const TEMPLATE_ID = "template_ynyayik"; // Replace with your actual EmailJS template ID
const USER_ID = "_FaISaFJ5SBxVUtzl"; // Optional if using public key

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  requestType: z.string({ required_error: "Please select a request type." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
});

export default function Requests() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("support");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      requestType: "",
      subject: "",
      message: "",
      deviceModel: "",
      osVersion: "",
    },
  });

  const requestTypes = {
    support: [
      { value: "technical-issue", label: "Technical Issue" },
      { value: "software-problem", label: "Software Problem" },
      { value: "hardware-problem", label: "Hardware Problem" },
      { value: "windows-installation", label: "Windows Installation Help" },
      { value: "driver-issue", label: "Driver Issue" },
      { value: "other-support", label: "Other Support Request" },
    ],
    driver: [
      { value: "missing-driver", label: "Missing Driver Request" },
      { value: "driver-update", label: "Driver Update Request" },
      { value: "compatibility-issue", label: "Driver Compatibility Issue" },
      { value: "other-driver", label: "Other Driver Request" },
    ],
    guide: [
      { value: "repair-guide", label: "Repair Guide Request" },
      { value: "disassembly-guide", label: "Disassembly Guide Request" },
      { value: "tutorial-request", label: "Tutorial Request" },
      { value: "other-guide", label: "Other Guide Request" },
    ],
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Find label for requestType
      const allRequestTypes = [
        ...requestTypes.support,
        ...requestTypes.driver,
        ...requestTypes.guide,
      ];
      const requestTypeLabel =
        allRequestTypes.find((type) => type.value === values.requestType)?.label ||
        values.requestType;

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: values.name,
          email: values.email,
          phone: values.phone || "N/A",
          requestType: requestTypeLabel,
          subject: values.subject,
          message: values.message,
          deviceModel: values.deviceModel || "N/A",
          osVersion: values.osVersion || "N/A",
        },
        USER_ID
      );

      setIsSubmitted(true);
      form.reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to submit request. Please try again later.");
    }
  }

  return (

    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1
          className="text-4xl font-bold text-white mb-0 px-6 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
       Support Requests
			   <p className="text-xl text-blue-100 mb-8">
       Need help with your device? Submit a request and we'll get back to you.
    </p>
        </h1>
        
      </div>
	  

      {isSubmitted && (
        <Alert className="mb-8 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your request has been submitted. We'll get back to you via email soon.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>
            Fill out the form below to submit your request. We'll respond within 24-48
            hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="support"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="support">Technical Support</TabsTrigger>
              <TabsTrigger value="driver">Driver Request</TabsTrigger>
              <TabsTrigger value="guide">Guide Request</TabsTrigger>
            </TabsList>

            <TabsContent value="support">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Need technical assistance with your computer? Provide as much detail
                    as possible about the issue you're experiencing.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="driver">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Can't find a specific driver? Let us know your device details and
                    which driver you need.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guide">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    Need a specific repair or disassembly guide? Tell us which device you
                    need help with.
                  </p>
                </div>
              </div>
            </TabsContent>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>We'll use this to respond to your request.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select request type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(activeTab === "support"
                              ? requestTypes.support
                              : activeTab === "driver"
                              ? requestTypes.driver
                              : requestTypes.guide
                            ).map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief subject of your request" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue or request in detail"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deviceModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Model (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Thomson N17, Roxxor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="osVersion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OS Version (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Windows 11 24H2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6 text-sm text-gray-500">
          <p>Your data is handled according to our privacy policy.</p>
        </CardFooter>
      </Card>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              For direct support, you can also email us at:
            </p>
            <p className="font-medium">support@example.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We typically respond to all requests within 24-48 hours during business
              days.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">For support requiring immediate attention:</p>
            <p className="font-medium">Call: +1 (800) 123-4567</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
