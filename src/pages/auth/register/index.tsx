/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import axios, { AxiosError } from "axios";
import Router, { useRouter } from "next/router";
import {
  Button,
  FormControl,
  Select,
  FormItem,
  FormLabel,
  Input,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
  useUser,
  Logo2,
} from "@/components";
import Head from "next/head";
import { Loader2, Logs } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import { cn } from "@/lib/utils";

// Define form input types
interface FormData {
  name: string;
  phone: string;
  district: string;
  thana: string;
  instituteId: string;
  hsc_batch: string;
  email: string;
  gender: string;
  goal: string;
  joiningId: string;
  status: string;
}
type DistrictData = {
  id: number | string;
  name: string;
};

interface CollegeData {
  id: number | string;
  school_name: string;
}

export default function SignUpForm() {
  const { user } = useUser();
  const { toast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [thanas, setThanas] = useState<DistrictData[]>([]);
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [district, setDistrict] = useState<number | string>("");
  const [thana, setThana] = useState<number | string>("");
  const [college, setCollege] = useState<number | string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [joiningIdLoading, setJoiningIdLoading] = useState<boolean>(false);
  const [collegeLoading, setCollegeLoading] = useState<boolean>(false);
  const [joiningId, setJoiningId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const methods = useForm<FormData>({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      district: district.toString(),
      thana: thana.toString(),
      instituteId: college.toString(),
      hsc_batch: user?.hsc_batch || "",
      email: user?.email || "",
      joiningId: joiningId,
      // status: 'active'
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    async function getme() {
      localStorage.removeItem("user");
      if (!!user?.email) {
        try {
          setValue("name", user?.name);
          setValue("phone", user?.phone || "");
          setValue("email", user?.email);
          setValue("joiningId", user?.joiningId as string);
          // setValue('status', 'active')
        } catch (error) {
          handleError(error as AxiosError);
        }
      }
    }
    getme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const getDistricts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${secondaryAPI}/api/location/districts`
        );
        setDistricts(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getDistricts();
  }, [step]);

  useEffect(() => {
    const getThanas = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${secondaryAPI}/api/location/thanas/${district}`
        );
        // setDistricts(data.districts);
        setThanas(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (district) getThanas();
  }, [step, district]);

  useEffect(() => {
    const getColleges = async () => {
      setCollegeLoading(true);
      try {
        const { data } = await axios.get(
          `${secondaryAPI}/api/location/schools/${thana}`
        );
        setColleges(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setCollegeLoading(false);
      }
    };
    if (thana) getColleges();
  }, [district, thana]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      await axios.post(
        `${secondaryAPI}/api/auth/register`,
        {
          ...data,
          phone: data.phone.slice(-11),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      router.push("/auth/onboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      handleError(error as AxiosError);
      setLoading(false);
      toast({
        title: "Error!",
        description: error?.response?.data?.errors[0]?.message,
        variant: "destructive",
      });
    }
  };

  const verifyJoiningId = async () => {
    try {
      setJoiningIdLoading(true);
      await axios.post(
        `${secondaryAPI}/api/auth/verify-joining-id`,
        { joiningId: joiningId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      router.push("/auth/onboard");
      // setStep(2);
      setJoiningIdLoading(false);
    } catch (err) {
      setJoiningIdLoading(false);
      handleError(err as AxiosError, verifyJoiningId);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.errors[0].message);
        toast({
          title: "Error!",
          description: err.response.data.errors[0].message,
          variant: "destructive",
        });
      }
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>Smart Community | Register</title>
      </Head>
      <div className="bg-white min-h-screen w-full grid">
        <div className="h-full grid">
          <div className="max-w-xl w-full mx-auto p-4 grid items-center !text-black">
            {/* <ToastContainer /> */}
            <div>
              {step === 1 ? (
                <div className="px-5 py-10 grid ring-2 ring-elegant/40 backdrop-blur-sm rounded-xl grid-cols-1 justify-center w-full space-y-3">
                  <div className="flex justify-center">
                    <Logo2 />
                  </div>
                  <h2 className="text-center text-2xl font-semibold">
                    এক্সেস কোড ভেরিফাই
                  </h2>
                  <h3 className="text-center text-sm text-light">
                    কোর্স কেনার সময় ASG Shop থেকে প্রাপ্ত Access Code দিতে হবে
                  </h3>
                  <FormProvider {...methods}>
                    <FormItem className="w-full grid">
                      <FormLabel>এক্সেস কোড</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          className={cn(
                            "!w-full !rounded-full !px-4 !ring-1 ring-hot/30",
                            !!error && "!ring-hot"
                          )}
                          onChange={(e) => {
                            setError("");
                            setJoiningId(e.target.value);
                            setValue("joiningId", e.target.value);
                          }}
                          id="joiningId"
                          placeholder="আক্সেস কোড"
                        />
                      </FormControl>
                    </FormItem>
                    <div className="grid gap-2 py-2">
                      <Button
                        className="w-full bg-gradient-to-r from-elegant !rounded-full to-elegant/70 text-white"
                        onClick={verifyJoiningId}
                        disabled={joiningIdLoading}
                      >
                        {joiningIdLoading ? "ভেরিফাইং..." : "সাবমিট করুন"}
                      </Button>
                      {/* <Button
                        className="w-full bg-gradient-to-r from-light !rounded-full to-light/70 text-white"
                        onClick={() => router.push("/auth/onboard")}
                        disabled={joiningIdLoading}
                      >
                        {"৭ দিনের ফ্রি ট্রায়াল দিয়ে দেখো"}
                      </Button> */}
                    </div>
                  </FormProvider>
                </div>
              ) : (
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="gap-4 bg-white/50 backdrop-blur-sm ring-1 shadow-light/30 shadow-md ring-ash rounded-lg p-5  grid grid-cols-2"
                  >
                    <div className="text-center text-2xl font-semibold col-span-2">
                      রেজিস্ট্রেশন সম্পন্ন কর
                    </div>

                    <FormItem className="col-span-2">
                      <FormLabel>নাম</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          className="!ring-light !ring-2"
                          {...register("name", { required: true })}
                          placeholder="তোমার নাম"
                        />
                      </FormControl>
                      {errors.name && (
                        <p className="text-red-500">Name is required</p>
                      )}
                    </FormItem>

                    <FormItem className="col-span-2">
                      <FormLabel>ফোন নম্বর</FormLabel>
                      <FormControl>
                        <Input
                          id="phone"
                          className="!ring-light !ring-2"
                          {...register("phone", { required: true })}
                          placeholder="ফোন নম্বর"
                        />
                      </FormControl>
                      {errors.phone && (
                        <p className="text-red-500">Phone number is required</p>
                      )}
                    </FormItem>

                    <FormItem className="col-span-2">
                      <FormLabel>ই-মেইল এড্রেস</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          className="!ring-light !ring-2"
                          {...register("email")}
                          disabled
                          placeholder="ই-মেইল এড্রেস"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-1">
                      <FormLabel>জেলা</FormLabel>
                      <FormControl {...register("district")}>
                        <Select
                          name="district"
                          value={district as string}
                          onValueChange={(value) => {
                            setDistrict(value);
                            setValue("district", value);
                          }}
                        >
                          <SelectTrigger className="w-full !ring-light !ring-2">
                            <SelectValue placeholder="জেলা নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Select District</SelectLabel> */}
                              {districts?.map((distr) => (
                                <SelectItem
                                  key={distr.id}
                                  value={distr.id.toString()}
                                >
                                  {distr.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-1">
                      <FormLabel>থানা</FormLabel>
                      <FormControl {...register("thana")}>
                        <Select
                          name="thana"
                          value={thana as string}
                          onValueChange={(value) => {
                            setThana(value);
                            setValue("thana", value);
                          }}
                        >
                          <SelectTrigger
                            id="thana"
                            className="w-full !ring-light !ring-2"
                          >
                            <SelectValue placeholder="থানা নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Select Thana</SelectLabel> */}
                              {thanas.map((thana) => (
                                <SelectItem
                                  key={thana.id}
                                  value={thana.id.toString()}
                                >
                                  {thana.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-2">
                      <FormLabel>কলেজ</FormLabel>
                      <FormControl {...register("instituteId")}>
                        <Select
                          name="instituteId"
                          value={college as string}
                          onValueChange={(value) => {
                            setCollege(value);
                            setValue("instituteId", value);
                          }}
                        >
                          <SelectTrigger className="w-full !ring-light !ring-2">
                            <SelectValue placeholder="কলেজ নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {collegeLoading ? (
                              <Logs className="w-4 h-4 animate-spin text-center" />
                            ) : (
                              <SelectGroup>
                                {/* <SelectLabel>Select College</SelectLabel> */}
                                {colleges.map((college) => (
                                  <SelectItem
                                    key={college.id}
                                    value={college.id.toString()}
                                  >
                                    {college.school_name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-1">
                      <FormLabel>এইচ এস সি ব্যাচ</FormLabel>
                      <FormControl {...register("hsc_batch")}>
                        <Select
                          name="hsc_batch"
                          onValueChange={(value) => {
                            setValue("hsc_batch", value);
                          }}
                        >
                          <SelectTrigger className="w-full !ring-2 focus:!ring-2 !ring-light">
                            <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Select Batch</SelectLabel> */}
                              {["HSC 25", "HSC 26"].map((batch) => (
                                <SelectItem key={batch} value={batch}>
                                  {batch}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-1">
                      <FormLabel>তুমি ছাত্র না ছাত্রী?</FormLabel>
                      <FormControl {...register("gender")}>
                        <Select
                          name="gender"
                          onValueChange={(value) => {
                            setValue("gender", value);
                          }}
                        >
                          <SelectTrigger className="w-full !ring-light !ring-2">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Select Gender</SelectLabel> */}
                              <SelectItem value="boy">ছাত্র</SelectItem>
                              <SelectItem value="girl">ছাত্রী</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem className="col-span-2">
                      <FormLabel>তোমার এডমিশনের লক্ষ্য কী?</FormLabel>
                      <FormControl {...register("goal")}>
                        <Select
                          name="goal"
                          onValueChange={(value) => {
                            setValue("goal", value);
                          }}
                        >
                          <SelectTrigger className="w-full !ring-light !ring-2">
                            <SelectValue placeholder="লক্ষ্য নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Select Goal</SelectLabel> */}
                              <SelectItem value="medical">মেডিকেল</SelectItem>
                              <SelectItem value="engineering">
                                ইঞ্জিনিয়ারিং
                              </SelectItem>
                              <SelectItem value="varsity">ভার্সিটি</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <div className="col-span-2 pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-elegant !rounded-full text-white"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "সাইন আপ"
                        )}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
