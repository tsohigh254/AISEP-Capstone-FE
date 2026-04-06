"use client";

import React from "react";
import { ArrowRight, Sparkles, Target, Users } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Users,
    title: "Khám phá startup phù hợp",
    desc: "Tiếp cận hệ sinh thái startup tiềm năng theo đúng khẩu vị đầu tư của bạn.",
  },
  {
    icon: Target,
    title: "Thiết lập hồ sơ nhanh",
    desc: "Chỉ cần vài thông tin cốt lõi để bắt đầu hành trình investor trên AISEP.",
  },
  {
    icon: Sparkles,
    title: "Mở khóa đề xuất chất lượng",
    desc: "Hệ thống ưu tiên gợi ý các cơ hội sát với định hướng đầu tư của bạn.",
  },
];

function AisepMark() {
  return (
    <svg className="h-10 w-auto" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#F0A500"
        d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"
      />
    </svg>
  );
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="mx-auto max-w-[620px] text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex size-28 items-center justify-center rounded-[34px] border border-[#f4e7a9] bg-white/92 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <AisepMark />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Investor Onboarding
            </div>
            <h1 className="text-[34px] font-black tracking-tight text-slate-900 md:text-[40px]">
              Chào mừng bạn đến với AISEP
            </h1>
            <p className="mx-auto max-w-[520px] text-[15px] leading-7 text-slate-500">
              Hoàn thiện hồ sơ investor cơ bản để bắt đầu khám phá startup, theo dõi
              cơ hội đầu tư và kết nối với những đội ngũ tiềm năng nhất trên nền tảng.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#eec54e]/12 text-[#c79217]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[12px] leading-6 text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[13px] font-bold text-slate-900">Quy trình thiết lập rất ngắn</p>
          <p className="mt-1 text-[12px] leading-6 text-slate-500">
            Bạn chỉ mất khoảng 2 phút để hoàn thiện hồ sơ investor cơ bản. Các thông tin
            chuyên sâu hơn có thể cập nhật thêm sau khi vào workspace.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onNext}
            className="group inline-flex h-12 min-w-[280px] items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-6 text-[14px] font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition-all hover:scale-[1.01] hover:bg-[#16213a] active:scale-[0.98]"
          >
            Bắt đầu thiết lập hồ sơ
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
