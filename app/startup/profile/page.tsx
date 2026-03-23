"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, ImagePlus } from "lucide-react";
import { TeamTab } from "./team-tab";
import {
  CreateStartupProfile,
  UpdateStartupProfile,
  GetStartupProfile,
  StartupStage,
  ICreateStartupRequest,
  IUpdateStartupRequest,
  SubmitForApproval
} from "@/services/startup/startup.api";

// Temporarily mock industries until API call is available
const MOCK_INDUSTRIES = [
  { id: 1, name: "AI & Technology" },
  { id: 2, name: "Fintech" },
  { id: 3, name: "Healthcare" },
  { id: 4, name: "E-commerce" },
  { id: 5, name: "EdTech" },
  { id: 6, name: "ClimateTech" }
];

export default function StartupProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // File states mapping
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [profileLogoURL, setProfileLogoURL] = useState<string>("");
  const [activeTab, setActiveTab] = useState("main-info");

  const [form, setForm] = useState({
    companyName: "",
    oneLiner: "",
    description: "",
    industryID: "",
    subIndustry: "",
    stage: StartupStage.Idea.toString(),
    foundedDate: "",
    teamSize: "",
    location: "",
    country: "",
    website: "",
    fundingAmountSought: "",
    currentFundingRaised: "",
    valuation: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await GetStartupProfile();
      if (res.data && res.data) {
        setIsEditing(true);
        const data = res.data;
        // Map backend data to form state (adjust fields if real backend returns different keys)
        setForm({
          companyName: data.companyName || "",
          oneLiner: data.oneLiner || "",
          description: data.description || "",
          industryID: data.industryID?.toString() || "",
          subIndustry: data.subIndustry || "",
          stage: data.stage !== undefined ? data.stage.toString() : StartupStage.Idea.toString(),
          foundedDate: data.foundedDate ? new Date(data.foundedDate).toISOString().split('T')[0] : "",
          teamSize: data.teamSize?.toString() || "",
          location: data.location || "",
          country: data.country || "",
          website: data.website || "",
          fundingAmountSought: data.fundingAmountSought?.toString() || "",
          currentFundingRaised: data.currentFundingRaised?.toString() || "",
          valuation: data.valuation?.toString() || "",
        });
        if (data.logoURL) {
          setProfileLogoURL(data.logoURL);
        }
      }
    } catch (error) {
      console.log("No existing profile or error fetching profile:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const saveProfile = async () => {
    const payload: any = {
      companyName: form.companyName,
      oneLiner: form.oneLiner,
      description: form.description,
      industryID: form.industryID ? parseInt(form.industryID) : undefined,
      subIndustry: form.subIndustry,
      stage: parseInt(form.stage) as StartupStage,
      foundedDate: form.foundedDate ? new Date(form.foundedDate) : undefined,
      teamSize: form.teamSize ? parseInt(form.teamSize) : undefined,
      location: form.location,
      country: form.country,
      website: form.website,
      fundingAmountSought: form.fundingAmountSought ? parseFloat(form.fundingAmountSought) : undefined,
      currentFundingRaised: form.currentFundingRaised ? parseFloat(form.currentFundingRaised) : undefined,
      valuation: form.valuation ? parseFloat(form.valuation) : undefined,
    };

    if (logoFile) {
      payload.logoURL = logoFile;
    }

    if (isEditing) {
      await UpdateStartupProfile(payload as IUpdateStartupRequest);
    } else {
      await CreateStartupProfile(payload as ICreateStartupRequest);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await saveProfile();
      // Re-fetch to get the updated logoURL from server
      await fetchProfile();
      setLogoFile(null);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await saveProfile();
      await SubmitForApproval();
      // Re-fetch to get the updated logoURL from server
      await fetchProfile();
      setLogoFile(null);
    } catch (error) {
      console.error("Failed to submit profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <StartupShell>
      <div className="max-w-5xl mx-auto py-8 px-6 w-full">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa hồ sơ Startup
          </h1>
        </div>

        {/* Tabs Layer */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 space-x-8">
            <TabsTrigger value="main-info" className="text-gray-500 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:shadow-none rounded-none px-0 py-3 data-[state=active]:bg-transparent text-base font-semibold transition-colors">
              Thông tin chính
            </TabsTrigger>
            <TabsTrigger value="team" className="text-gray-500 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:shadow-none rounded-none px-0 py-3 data-[state=active]:bg-transparent text-base font-semibold transition-colors">
              Đội ngũ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main-info">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Logo Upload Section */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="relative w-48 h-48 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center overflow-hidden group transition-colors hover:border-blue-300"
                    >
                      {logoFile ? (
                        <img
                          src={URL.createObjectURL(logoFile)}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : profileLogoURL ? (
                        <img
                          src={profileLogoURL}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <ImagePlus className="w-10 h-10" />
                          <span className="text-xs">Logo công ty</span>
                        </div>
                      )}
                      {/* Remove overlay on hover when there's an image */}
                      {(logoFile || profileLogoURL) && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            type="button"
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                            onClick={() => {
                              setLogoFile(null);
                              setProfileLogoURL("");
                            }}
                            title="Xóa ảnh"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="logo"
                      className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Thay đổi ảnh
                      <input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={form.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                          required
                          placeholder="e.g. OpenAI"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="oneLiner">One Liner</Label>
                        <Input
                          id="oneLiner"
                          value={form.oneLiner}
                          onChange={(e) => handleChange("oneLiner", e.target.value)}
                          placeholder="Your startup in one sentence..."
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="description">Full Description</Label>
                        <Textarea
                          id="description"
                          value={form.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          className="min-h-[100px]"
                          placeholder="Detailed explanation of your business..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="industryID">Industry</Label>
                        <Select value={form.industryID} onChange={(e) => handleChange("industryID", e.target.value)}>
                          <option value="" disabled>Select Industry</option>
                          {MOCK_INDUSTRIES.map((ind) => (
                            <option key={ind.id} value={ind.id.toString()}>
                              {ind.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="subIndustry">Sub-Industry</Label>
                        <Input
                          id="subIndustry"
                          value={form.subIndustry}
                          onChange={(e) => handleChange("subIndustry", e.target.value)}
                          placeholder="e.g. Machine Learning"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="stage">Funding Stage *</Label>
                        <Select value={form.stage} onChange={(e) => handleChange("stage", e.target.value)} required>
                          <option value="" disabled>Select Stage</option>
                          <option value={StartupStage.Idea.toString()}>Idea</option>
                          <option value={StartupStage.PreSeed.toString()}>Pre-Seed</option>
                          <option value={StartupStage.Seed.toString()}>Seed</option>
                          <option value={StartupStage.SeriesA.toString()}>Series A</option>
                          <option value={StartupStage.SeriesB.toString()}>Series B</option>
                          <option value={StartupStage.SeriesC.toString()}>Series C+</option>
                          <option value={StartupStage.Growth.toString()}>Growth</option>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="foundedDate">Founded Date</Label>
                        <Input
                          id="foundedDate"
                          type="date"
                          value={form.foundedDate}
                          onChange={(e) => handleChange("foundedDate", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input
                          id="teamSize"
                          type="number"
                          value={form.teamSize}
                          onChange={(e) => handleChange("teamSize", e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location & Contact */}
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Location & Presence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={form.country}
                          onChange={(e) => handleChange("country", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="location">City / Location</Label>
                        <Input
                          id="location"
                          value={form.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={form.website}
                          onChange={(e) => handleChange("website", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Financials (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fundingAmountSought">Amount Sought ($)</Label>
                        <Input
                          id="fundingAmountSought"
                          type="number"
                          value={form.fundingAmountSought}
                          onChange={(e) => handleChange("fundingAmountSought", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="currentFundingRaised">Current Raised ($)</Label>
                        <Input
                          id="currentFundingRaised"
                          type="number"
                          value={form.currentFundingRaised}
                          onChange={(e) => handleChange("currentFundingRaised", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="valuation">Valuation ($)</Label>
                        <Input
                          id="valuation"
                          type="number"
                          value={form.valuation}
                          onChange={(e) => handleChange("valuation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>



                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isLoading ? "Saving..." : "Submit Profile"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fundraising">
            <div className="py-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
              Tính năng Gọi vốn đang được phát triển.
            </div>
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="kyc">
            <div className="py-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
              Tính năng Định danh KYC đang được phát triển.
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </StartupShell>
  );
}

