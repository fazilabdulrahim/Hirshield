import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestCaseResult {
  test_case_number: number;
  test_name: string;
  status: "PASS" | "FAIL" | "UNVERIFIED";
  details: string;
}

interface AnalysisResponse {
  overall_status: string;
  passed_count: number;
  failed_count: number;
  unverified_count: number;
  results: TestCaseResult[];
  fetched_content_length: number;
}

// ---- Known scam indicators (TC08) ----
const KNOWN_SCAM_DOMAINS = [
  "scamjob.example",
  "fake-recruit.example",
  "nigerian-job-scam.example",
];

const SCAM_KEYWORDS = [
  "work from home earn thousands",
  "guaranteed income from home",
  "no experience needed earn",
  "wire transfer",
  "western union",
  "moneygram",
  "bitcoin payment",
  "cryptocurrency payment for training",
  "upfront payment required",
  "send money to get job",
  "pay for training materials",
  "registration fee required",
];

// ---- Payment request keywords (TC05) ----
const PAYMENT_KEYWORDS = [
  "registration fee",
  "interview fee",
  "placement fee",
  "training fee",
  "processing fee",
  "application fee",
  "security deposit",
  "refundable deposit",
  "pay for training",
  "pay to apply",
  "payment required to proceed",
  "bank transfer for processing",
  "send money",
  "wire money",
  "pay upfront",
];

// ---- Sensitive info keywords (TC09) ----
const SENSITIVE_INFO_KEYWORDS = [
  "password",
  "otp",
  "one time password",
  "bank account number",
  "credit card number",
  "cvv",
  "pin code",
  "social security number",
  "ssn",
  "net banking password",
  "atm pin",
  "debit card number",
  "routing number",
  "bank credentials",
];

// ---- SSRF protection: block private / internal IPs ----
function isPrivateOrReservedIP(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h.endsWith(".localhost")) return true;
  if (h === "metadata.google.internal") return true;

  // IPv4 checks
  const ipParts = h.split(".").map(Number);
  if (ipParts.length === 4 && ipParts.every((n) => n >= 0 && n <= 255)) {
    const [a, b] = ipParts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local
    if (a === 0) return true;
    if (a >= 224) return true; // multicast / reserved
  }

  // IPv6 checks
  if (h.includes(":")) {
    if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
    if (h.startsWith("fe80")) return true; // link-local
    if (h === "::1" || h === "::") return true;
  }

  return false;
}

// ---- TC01: URL format validation ----
function tc01_UrlValidation(url: string, parsed: URL | null): TestCaseResult {
  if (!parsed) {
    return {
      test_case_number: 1,
      test_name: "Job URL Validation",
      status: "FAIL",
      details: "The submitted URL is not a valid HTTP or HTTPS URL. It must start with http:// or https:// and have a valid domain.",
    };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      test_case_number: 1,
      test_name: "Job URL Validation",
      status: "FAIL",
      details: `URL protocol "${parsed.protocol}" is not allowed. Only HTTP and HTTPS URLs are accepted.`,
    };
  }
  if (!parsed.hostname || parsed.hostname.length < 3) {
    return {
      test_case_number: 1,
      test_name: "Job URL Validation",
      status: "FAIL",
      details: "The URL does not contain a valid hostname.",
    };
  }
  return {
    test_case_number: 1,
    test_name: "Job URL Validation",
    status: "PASS",
    details: "The submitted URL has a valid HTTP/HTTPS format with a proper domain name.",
  };
}

// ---- TC02: HTTPS security check ----
function tc02_HttpsSecurity(url: string, parsed: URL | null, fetchOk: boolean, fetchStatus: number): TestCaseResult {
  if (!parsed) {
    return {
      test_case_number: 2,
      test_name: "HTTPS Security",
      status: "FAIL",
      details: "Cannot evaluate HTTPS — the URL is invalid.",
    };
  }
  if (parsed.protocol === "http:") {
    return {
      test_case_number: 2,
      test_name: "HTTPS Security",
      status: "FAIL",
      details: "The job posting uses an insecure HTTP connection (no HTTPS). Legitimate employers typically use HTTPS to protect user data.",
    };
  }
  // For HTTPS, we verified by attempting the fetch. If fetch succeeded with TLS, certificate is valid.
  if (fetchOk) {
    return {
      test_case_number: 2,
      test_name: "HTTPS Security",
      status: "PASS",
      details: "The job posting uses HTTPS and the TLS connection was established successfully, indicating a valid certificate.",
    };
  }
  // Fetch failed — could be TLS error, could be network, could be blocking
  if (fetchStatus === 0) {
    return {
      test_case_number: 2,
      test_name: "HTTPS Security",
      status: "UNVERIFIED",
      details: "The URL uses HTTPS but the server could not be reached to fully verify the TLS certificate. The connection may be blocked, expired, or unreachable.",
    };
  }
  return {
    test_case_number: 2,
    test_name: "HTTPS Security",
    status: "PASS",
    details: "The job posting uses HTTPS. The TLS certificate appears valid based on the connection attempt.",
  };
}

// ---- TC03: Company information check ----
function tc03_CompanyInformation(text: string): TestCaseResult {
  const lower = text.toLowerCase();
  const companyIndicators = [
    "about us",
    "about the company",
    "company name",
    "company profile",
    "our company",
    "who we are",
    "about company",
    "company overview",
    "company description",
    "employer",
    "organization",
  ];

  // Also look for common company-name patterns near "company" label
  const hasCompanyLabel = /company\s*[:\-]?\s*[a-z][a-z\s&.,']{2,40}/i.test(text);

  const found = companyIndicators.filter((kw) => lower.includes(kw));

  if (found.length >= 2 || hasCompanyLabel) {
    return {
      test_case_number: 3,
      test_name: "Company Information",
      status: "PASS",
      details: `Company information was found on the job posting page (indicators: ${found.slice(0, 3).join(", ") || "company name label detected"}).`,
    };
  }
  if (found.length === 1) {
    return {
      test_case_number: 3,
      test_name: "Company Information",
      status: "PASS",
      details: `Some company information was found (indicator: "${found[0]}"). However, details are limited.`,
    };
  }
  return {
    test_case_number: 3,
    test_name: "Company Information",
    status: "FAIL",
    details: "No company information was found on the job posting. Legitimate job postings typically include the employer's name and a description of the company.",
  };
}

// ---- TC04: Contact information check ----
function tc04_ContactInformation(text: string): TestCaseResult {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+?\d[\d\s\-()]{7,}\d)/;
  const hasEmail = emailPattern.test(text);
  const hasPhone = phonePattern.test(text);

  // Check for free email providers (less credible for recruitment)
  const freeEmailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "rediffmail.com", "protonmail.com"];
  const emailMatch = text.match(emailPattern);
  const emailDomain = emailMatch ? emailMatch[0].split("@")[1]?.toLowerCase() : null;
  const usesFreeEmail = emailDomain ? freeEmailProviders.includes(emailDomain) : false;

  if (hasEmail && hasPhone && !usesFreeEmail) {
    return {
      test_case_number: 4,
      test_name: "Contact Information",
      status: "PASS",
      details: `A professional email address (${emailDomain}) and phone number were found. This increases credibility.`,
    };
  }
  if (hasEmail && hasPhone && usesFreeEmail) {
    return {
      test_case_number: 4,
      test_name: "Contact Information",
      status: "FAIL",
      details: `Contact info was found, but the recruiter is using a free email provider (${emailDomain}) instead of a company domain. Legitimate companies typically use their own domain for recruitment.`,
    };
  }
  if (hasEmail && !usesFreeEmail) {
    return {
      test_case_number: 4,
      test_name: "Contact Information",
      status: "PASS",
      details: `A professional email address (${emailDomain}) was found. No phone number detected, but a company-domain email is a positive sign.`,
    };
  }
  if (hasEmail && usesFreeEmail) {
    return {
      test_case_number: 4,
      test_name: "Contact Information",
      status: "FAIL",
      details: `The only email found is a free email provider (${emailDomain}) with no company-domain contact. This is a common pattern in fraudulent postings.`,
    };
  }
  if (hasPhone) {
    return {
      test_case_number: 4,
      test_name: "Contact Information",
      status: "UNVERIFIED",
      details: "A phone number was found but no email address. Without an email, recruiter credibility cannot be fully verified.",
    };
  }
  return {
    test_case_number: 4,
    test_name: "Contact Information",
    status: "FAIL",
    details: "No recruiter contact information (email or phone) was found on the job posting. Legitimate employers provide a way to contact them.",
  };
}

// ---- TC05: Payment request detection ----
function tc05_PaymentDetection(text: string): TestCaseResult {
  const lower = text.toLowerCase();
  const found = PAYMENT_KEYWORDS.filter((kw) => lower.includes(kw));

  if (found.length >= 2) {
    return {
      test_case_number: 5,
      test_name: "Payment Detection",
      status: "FAIL",
      details: `Multiple payment requests were detected on the job posting: ${found.join(", ")}. Legitimate employers never ask job seekers for money during recruitment.`,
    };
  }
  if (found.length === 1) {
    return {
      test_case_number: 5,
      test_name: "Payment Detection",
      status: "FAIL",
      details: `A payment request was detected: "${found[0]}". Legitimate employers do not ask for money during the recruitment process. This is a major red flag.`,
    };
  }
  return {
    test_case_number: 5,
    test_name: "Payment Detection",
    status: "PASS",
    details: "No payment or fee requests were detected in the job posting. Legitimate employers do not charge candidates for interviews, training, or placement.",
  };
}

// ---- TC06: Unrealistic salary detection ----
function tc06_SalaryDetection(text: string): TestCaseResult {
  const lower = text.toLowerCase();

  // Look for salary figures
  const salaryPatterns = [
    /(?:salary|pay|compensation|earn|ctc|package)[:\s]*(?:rs\.?|inr|\$|usd|€|eur|£|gbp)?\s*([\d,]+)/gi,
    /([\d][\d,]{4,})\s*(?:per\s*month|per\s*annum|monthly|annually|yearly|p\.a\.|lpa|lakhs?)/gi,
    /(\d[\d,]*)\s*(?:lakhs?|lpa)\b/gi,
  ];

  const figures: number[] = [];
  for (const pattern of salaryPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const num = parseInt(match[1]?.replace(/,/g, "") || "0", 10);
      if (num > 0) figures.push(num);
    }
  }

  // Also detect vague "unlimited earning" type claims
  const unrealisticClaims = [
    "unlimited earning",
    "earn thousands",
    "earn lakhs",
    "get rich",
    "guaranteed income",
    "earn from home",
    "easy money",
    "quick money",
    "high income guaranteed",
    "earn 50000 daily",
    "earn 100000 daily",
  ];
  const foundClaims = unrealisticClaims.filter((c) => lower.includes(c));

  // Check for very high figures without job details context
  const hasJobDetails = /responsibilit|qualif|require|skill|experience|role|duty/i.test(text);
  const veryHighFigure = figures.some((f) => {
    // If figure looks like > 1,000,000 (could be INR) without context, flag
    return f > 1000000 && !hasJobDetails;
  });

  if (foundClaims.length > 0) {
    return {
      test_case_number: 6,
      test_name: "Salary Detection",
      status: "FAIL",
      details: `Unrealistic salary or earning claims were detected: "${foundClaims.join('", "')}". Job postings promising unusually high or guaranteed income without credible details are a common scam indicator.`,
    };
  }

  if (veryHighFigure) {
    return {
      test_case_number: 6,
      test_name: "Salary Detection",
      status: "FAIL",
      details: `An unusually high salary figure was detected (e.g., ${figures.find((f) => f > 1000000)?.toLocaleString()}), but the posting lacks sufficient job details to support this claim. This could be an unrealistic salary bait.`,
    };
  }

  if (figures.length > 0) {
    return {
      test_case_number: 6,
      test_name: "Salary Detection",
      status: "PASS",
      details: `Salary information was found (${figures[0].toLocaleString()}) and appears within a reasonable range for the context. No unrealistic claims detected.`,
    };
  }

  return {
    test_case_number: 6,
    test_name: "Salary Detection",
    status: "UNVERIFIED",
    details: "No salary information was found on the job posting. While the absence of salary is not inherently suspicious, it means compensation claims could not be evaluated.",
  };
}

// ---- TC07: Job description check ----
function tc07_JobDescription(text: string): TestCaseResult {
  const lower = text.toLowerCase();
  const requiredElements = [
    { key: "job responsibilities", patterns: ["responsibilit", "duties", "what you will do", "role involves", "key tasks"] },
    { key: "qualifications", patterns: ["qualif", "education", "degree", "eligibility", "requirements"] },
    { key: "skills", patterns: ["skills", "proficient in", "knowledge of", "experience in", "expertise"] },
    { key: "job role", patterns: ["job title", "position", "role", "designation", "job role", "vacancy"] },
  ];

  const missing: string[] = [];
  const present: string[] = [];

  for (const el of requiredElements) {
    const found = el.patterns.some((p) => lower.includes(p));
    if (found) present.push(el.key);
    else missing.push(el.key);
  }

  if (missing.length === 0) {
    return {
      test_case_number: 7,
      test_name: "Job Description",
      status: "PASS",
      details: `The job description includes all key elements: ${present.join(", ")}.`,
    };
  }

  if (missing.length <= 1) {
    return {
      test_case_number: 7,
      test_name: "Job Description",
      status: "PASS",
      details: `The job description includes most key elements (${present.join(", ")}). Missing: ${missing[0]}.`,
    };
  }

  if (missing.length === 3) {
    return {
      test_case_number: 7,
      test_name: "Job Description",
      status: "FAIL",
      details: `The job description is missing several important elements: ${missing.join(", ")}. Vague or incomplete descriptions are common in fake job postings.`,
    };
  }

  // missing.length === 4 → nothing found at all
  return {
    test_case_number: 7,
    test_name: "Job Description",
    status: "FAIL",
    details: "The job posting lacks a proper job description. No responsibilities, qualifications, skills, or job role information was found. This is a strong indicator of a fraudulent posting.",
  };
}

// ---- TC08: Known scam indicator check ----
function tc08_ScamIndicator(url: string, text: string): TestCaseResult {
  const lower = text.toLowerCase();
  const urlLower = url.toLowerCase();
  let parsed: URL | null = null;
  try { parsed = new URL(url); } catch { /* ignore */ }

  // Check domain against known scam domains
  if (parsed) {
    for (const domain of KNOWN_SCAM_DOMAINS) {
      if (parsed.hostname.includes(domain)) {
        return {
          test_case_number: 8,
          test_name: "Scam Indicator Check",
          status: "FAIL",
          details: `HIGH PRIORITY WARNING: The URL domain "${parsed.hostname}" matches a known scam indicator (${domain}). This job posting should be treated with extreme caution.`,
        };
      }
    }
  }

  // Check for scam keywords in content
  const foundKeywords = SCAM_KEYWORDS.filter((kw) => lower.includes(kw));

  // Check for suspicious URL shorteners
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"];
  const usesShortener = parsed ? shorteners.some((s) => parsed.hostname.includes(s)) : false;

  if (foundKeywords.length >= 2) {
    return {
      test_case_number: 8,
      test_name: "Scam Indicator Check",
      status: "FAIL",
      details: `HIGH PRIORITY WARNING: Multiple known scam indicators were detected: ${foundKeywords.join(", ")}. This posting strongly resembles known fraudulent job patterns.`,
    };
  }

  if (foundKeywords.length === 1) {
    return {
      test_case_number: 8,
      test_name: "Scam Indicator Check",
      status: "FAIL",
      details: `A known scam indicator was detected: "${foundKeywords[0]}". This keyword is commonly associated with fraudulent job postings.`,
    };
  }

  if (usesShortener) {
    return {
      test_case_number: 8,
      test_name: "Scam Indicator Check",
      status: "FAIL",
      details: `The URL uses a link shortener (${parsed?.hostname}), which obscures the real destination. Legitimate job postings typically link directly to the company's website.`,
    };
  }

  return {
    test_case_number: 8,
    test_name: "Scam Indicator Check",
    status: "PASS",
    details: "No known scam indicators were found in the URL or job posting content. The posting does not match known fraudulent patterns.",
  };
}

// ---- TC09: Sensitive information request detection ----
function tc09_SensitiveInformation(text: string): TestCaseResult {
  const lower = text.toLowerCase();
  const found = SENSITIVE_INFO_KEYWORDS.filter((kw) => lower.includes(kw));

  // Filter out incidental mentions (e.g., "password" in a login link is normal)
  const strongIndicators = found.filter((kw) => {
    // Check if it's in a request context
    const requestContext = [
      `enter your ${kw}`,
      `provide your ${kw}`,
      `share your ${kw}`,
      `submit your ${kw}`,
      `send your ${kw}`,
      `your ${kw} is required`,
      `${kw} required`,
      `need your ${kw}`,
    ];
    return requestContext.some((ctx) => lower.includes(ctx));
  });

  if (strongIndicators.length >= 2) {
    return {
      test_case_number: 9,
      test_name: "Sensitive Information",
      status: "FAIL",
      details: `HIGH PRIORITY WARNING: The job posting requests sensitive information: ${strongIndicators.join(", ")}. No legitimate employer asks for passwords, OTPs, or bank credentials during recruitment.`,
    };
  }

  if (strongIndicators.length === 1) {
    return {
      test_case_number: 9,
      test_name: "Sensitive Information",
      status: "FAIL",
      details: `The job posting requests sensitive information: "${strongIndicators[0]}". This is a major red flag — no legitimate employer asks for this during recruitment.`,
    };
  }

  if (found.length > 0) {
    // Keywords appear but not in a request context — could be incidental
    return {
      test_case_number: 9,
      test_name: "Sensitive Information",
      status: "UNVERIFIED",
      details: `Sensitive-information keywords were found (${found.slice(0, 2).join(", ")}) but not in a clear request context. Manual verification is recommended to confirm whether the posting actually asks for sensitive data.`,
    };
  }

  return {
    test_case_number: 9,
    test_name: "Sensitive Information",
    status: "PASS",
    details: "No requests for sensitive information (passwords, OTPs, bank credentials) were detected in the job posting.",
  };
}

// ---- TC10: Recruitment process verification ----
function tc10_RecruitmentVerification(url: string, text: string): TestCaseResult {
  const lower = text.toLowerCase();
  let parsed: URL | null = null;
  try { parsed = new URL(url); } catch { /* ignore */ }

  const officialChannels = [
    "careers",
    "career",
    "jobs",
    "jobs.",
    "/jobs",
    "/careers",
    "/career",
    "apply now",
    "apply online",
    "official application",
    "talent acquisition",
    "human resources",
    "recruitment process",
    "hiring process",
  ];

  const found = officialChannels.filter((kw) => lower.includes(kw));

  // Check if URL itself looks like a careers page
  const urlLooksOfficial = parsed ? /career|job|hiring|apply/i.test(parsed.pathname) : false;

  // Check for common job board domains (credible but third-party)
  const jobBoards = ["linkedin.com", "indeed.com", "glassdoor.com", "naukri.com", "monster.com", "simplyhired.com", "ziprecruiter.com"];
  const isJobBoard = parsed ? jobBoards.some((jb) => parsed.hostname.includes(jb)) : false;

  if (urlLooksOfficial || found.length >= 3) {
    return {
      test_case_number: 10,
      test_name: "Recruitment Verification",
      status: "PASS",
      details: `The posting appears connected to an official recruitment channel (indicators: ${found.slice(0, 3).join(", ") || "careers URL path detected"}).`,
    };
  }

  if (isJobBoard) {
    return {
      test_case_number: 10,
      test_name: "Recruitment Verification",
      status: "PASS",
      details: `The posting is hosted on a recognized job board (${parsed?.hostname}). While third-party, these platforms provide some level of employer verification.`,
    };
  }

  if (found.length >= 1) {
    return {
      test_case_number: 10,
      test_name: "Recruitment Verification",
      status: "UNVERIFIED",
      details: `Some recruitment indicators were found (${found.join(", ")}), but the posting is not clearly connected to an official company careers page or a recognized job board. Additional verification is recommended.`,
    };
  }

  return {
    test_case_number: 10,
    test_name: "Recruitment Verification",
    status: "UNVERIFIED",
    details: "The posting could not be verified as connected to an official company careers page or a recognized recruitment channel. This does not necessarily mean it is fraudulent, but manual verification is strongly recommended.",
  };
}

// ---- Main rule engine ----
function runRuleEngine(url: string, htmlText: string, fetchOk: boolean, fetchStatus: number): TestCaseResult[] {
  let parsed: URL | null = null;
  try { parsed = new URL(url); } catch { /* ignore */ }

  const results: TestCaseResult[] = [];

  results.push(tc01_UrlValidation(url, parsed));
  results.push(tc02_HttpsSecurity(url, parsed, fetchOk, fetchStatus));
  results.push(tc03_CompanyInformation(htmlText));
  results.push(tc04_ContactInformation(htmlText));
  results.push(tc05_PaymentDetection(htmlText));
  results.push(tc06_SalaryDetection(htmlText));
  results.push(tc07_JobDescription(htmlText));
  results.push(tc08_ScamIndicator(url, htmlText));
  results.push(tc09_SensitiveInformation(htmlText));
  results.push(tc10_RecruitmentVerification(url, htmlText));

  return results;
}

function computeOverallStatus(results: TestCaseResult[]): { status: string; passed: number; failed: number; unverified: number } {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const unverified = results.filter((r) => r.status === "UNVERIFIED").length;

  // Check for known malicious indicator (TC08 FAIL is high-priority)
  const tc08Failed = results.find((r) => r.test_case_number === 8 && r.status === "FAIL");

  let status: string;
  if (tc08Failed) {
    status = "HIGH_RISK_WARNING";
  } else if (failed === 0 && unverified === 0) {
    status = "PASSED_INITIAL_CHECKS";
  } else if (failed >= 3) {
    status = "HIGH_RISK_WARNING";
  } else if (failed >= 1) {
    status = "WARNING_POTENTIALLY_SUSPICIOUS";
  } else {
    // No failures but some unverified
    status = "PASSED_INITIAL_CHECKS";
  }

  return { status, passed, failed, unverified };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with the user's JWT for auth context
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's session
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { job_url } = body as { job_url?: string };

    if (!job_url || typeof job_url !== "string") {
      return new Response(JSON.stringify({ error: "job_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Validate URL format & SSRF protection ----
    let parsed: URL | null = null;
    try { parsed = new URL(job_url); } catch { /* invalid */ }

    if (!parsed || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
      // Run rule engine with empty content — TC01 will catch it
      const results = runRuleEngine(job_url, "", false, 0);
      const overall = computeOverallStatus(results);

      // Save to database
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: submission } = await serviceClient
        .from("job_submissions")
        .insert({
          user_id: user.id,
          job_url,
          overall_status: overall.status,
          passed_count: overall.passed,
          failed_count: overall.failed,
          unverified_count: overall.unverified,
        })
        .select("id")
        .single();

      if (submission) {
        const testRows = results.map((r) => ({
          submission_id: submission.id,
          test_case_number: r.test_case_number,
          test_name: r.test_name,
          status: r.status,
          details: r.details,
        }));
        await serviceClient.from("test_results").insert(testRows);
      }

      const response: AnalysisResponse = {
        overall_status: overall.status,
        passed_count: overall.passed,
        failed_count: overall.failed,
        unverified_count: overall.unverified,
        results,
        fetched_content_length: 0,
      };

      return new Response(JSON.stringify({ submission_id: submission?.id, ...response }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SSRF protection
    if (isPrivateOrReservedIP(parsed.hostname)) {
      const results = runRuleEngine(job_url, "", false, 0);
      // Override TC01 to PASS (URL format is valid) but add SSRF note
      results[0] = {
        test_case_number: 1,
        test_name: "Job URL Validation",
        status: "FAIL",
        details: "The URL points to an internal or private network address. Requests to private/reserved IP ranges are blocked for security (SSRF protection).",
      };
      const overall = computeOverallStatus(results);

      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: submission } = await serviceClient
        .from("job_submissions")
        .insert({
          user_id: user.id,
          job_url,
          overall_status: overall.status,
          passed_count: overall.passed,
          failed_count: overall.failed,
          unverified_count: overall.unverified,
        })
        .select("id")
        .single();

      if (submission) {
        const testRows = results.map((r) => ({
          submission_id: submission.id,
          test_case_number: r.test_case_number,
          test_name: r.test_name,
          status: r.status,
          details: r.details,
        }));
        await serviceClient.from("test_results").insert(testRows);
      }

      const response: AnalysisResponse = {
        overall_status: overall.status,
        passed_count: overall.passed,
        failed_count: overall.failed,
        unverified_count: overall.unverified,
        results,
        fetched_content_length: 0,
      };

      return new Response(JSON.stringify({ submission_id: submission?.id, ...response }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Fetch the job posting content ----
    let htmlText = "";
    let fetchOk = false;
    let fetchStatus = 0;
    const REDIRECT_LIMIT = 5;
    let currentUrl = job_url;

    for (let i = 0; i < REDIRECT_LIMIT; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "HIRESHIELD-Bot/1.0 (Job Fraud Analysis)",
            "Accept": "text/html,application/xhtml+xml,text/plain",
          },
          redirect: "manual",
        });
        clearTimeout(timeout);

        fetchStatus = resp.status;
        if (resp.status >= 300 && resp.status < 400 && resp.headers.get("location")) {
          const newUrl = new URL(resp.headers.get("location")!, currentUrl).href;
          // Check redirect target for SSRF
          let redirectParsed: URL;
          try { redirectParsed = new URL(newUrl); } catch { break; }
          if (isPrivateOrReservedIP(redirectParsed.hostname)) break;
          if (redirectParsed.protocol !== "http:" && redirectParsed.protocol !== "https:") break;
          currentUrl = newUrl;
          continue;
        }

        if (resp.ok) {
          fetchOk = true;
          const contentType = resp.headers.get("content-type") || "";
          if (contentType.includes("text") || contentType.includes("html") || contentType.includes("json") || contentType.includes("xml")) {
            htmlText = await resp.text();
          }
          break;
        } else {
          break;
        }
      } catch (err) {
        // fetch failed (network error, TLS error, timeout, etc.)
        fetchOk = false;
        fetchStatus = 0;
        break;
      }
    }

    // Strip HTML tags for text analysis
    let analysisText = htmlText;
    if (htmlText.includes("<")) {
      // Remove script and style content
      analysisText = htmlText.replace(/<script[\s\S]*?<\/script>/gi, " ");
      analysisText = analysisText.replace(/<style[\s\S]*?<\/style>/gi, " ");
      // Remove tags
      analysisText = analysisText.replace(/<[^>]+>/g, " ");
      // Decode common HTML entities
      analysisText = analysisText
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
      // Collapse whitespace
      analysisText = analysisText.replace(/\s+/g, " ").trim();
    }

    // If we couldn't fetch content, many tests will be UNVERIFIED
    if (!fetchOk || analysisText.length < 50) {
      let results = runRuleEngine(job_url, analysisText, fetchOk, fetchStatus);
      // Override content-dependent tests to UNVERIFIED if no content
      if (analysisText.length < 50) {
        results = results.map((r) => {
          if (r.test_case_number >= 3 && r.test_case_number <= 10 && r.status === "FAIL") {
            // Only override if the failure was due to lack of content, not an active finding
            if (r.test_case_number === 8) {
              // TC08: still check URL for scam indicators even without content
              return r;
            }
            return { ...r, status: "UNVERIFIED" as const, details: `${r.details} (Note: The job posting content could not be retrieved, so this test could not be fully performed.)` };
          }
          return r;
        });
      }
      const overall = computeOverallStatus(results);

      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: submission } = await serviceClient
        .from("job_submissions")
        .insert({
          user_id: user.id,
          job_url,
          overall_status: overall.status,
          passed_count: overall.passed,
          failed_count: overall.failed,
          unverified_count: overall.unverified,
        })
        .select("id")
        .single();

      if (submission) {
        const testRows = results.map((r) => ({
          submission_id: submission.id,
          test_case_number: r.test_case_number,
          test_name: r.test_name,
          status: r.status,
          details: r.details,
        }));
        await serviceClient.from("test_results").insert(testRows);
      }

      const response: AnalysisResponse = {
        overall_status: overall.status,
        passed_count: overall.passed,
        failed_count: overall.failed,
        unverified_count: overall.unverified,
        results,
        fetched_content_length: analysisText.length,
      };

      return new Response(JSON.stringify({ submission_id: submission?.id, ...response }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Run full rule engine ----
    const results = runRuleEngine(job_url, analysisText, fetchOk, fetchStatus);
    const overall = computeOverallStatus(results);

    // ---- Save to database ----
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: submission, error: insertError } = await serviceClient
      .from("job_submissions")
      .insert({
        user_id: user.id,
        job_url,
        overall_status: overall.status,
        passed_count: overall.passed,
        failed_count: overall.failed,
        unverified_count: overall.unverified,
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to save analysis results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const testRows = results.map((r) => ({
      submission_id: submission.id,
      test_case_number: r.test_case_number,
      test_name: r.test_name,
      status: r.status,
      details: r.details,
    }));
    await serviceClient.from("test_results").insert(testRows);

    const response: AnalysisResponse = {
      overall_status: overall.status,
      passed_count: overall.passed,
      failed_count: overall.failed,
      unverified_count: overall.unverified,
      results,
      fetched_content_length: analysisText.length,
    };

    return new Response(JSON.stringify({ submission_id: submission.id, ...response }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred during analysis" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
