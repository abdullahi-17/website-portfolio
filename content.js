/* Update content here. Use null for unavailable links; never use fake destinations.
   Replace an image path with a local WebP/JPEG and describe the real image in imageAlt. */
const portfolio = {
  contact: {
    email: "abdullahi.omer17@gmail.com",
    linkedin: "https://www.linkedin.com/in/abdullahiomer",
    github: "https://github.com/abdullahi-17",
    resume: "assets/Resume - Abdullahi O.pdf", // Example local path: "assets/abdullahi-omer-resume.pdf"
  },
  projects: [
    {
      id: "cloud-portfolio",
      category: "cloud",
      categoryLabel: "Cloud & Development",
      title: "Portfolio website",
      status: "Deployed on AWS / GitHub Actions verified",
      description:
        "A personal portfolio deployed on AWS, bringing together a static front end, Terraform infrastructure, CloudFront delivery and a Route 53 custom domain.",
      workOverview: [
        "CloudFront serves the site over HTTPS and reads the files from a private S3 bucket. Route 53 connects the custom domain, and Terraform describes the hosting infrastructure.",
        "GitHub Actions runs browser checks against the same artifact it deploys. A guarded rollback workflow restores a previously tested release.",
      ],
      image: "assets/cloud-architecture.svg",
      imageAlt:
        "Portfolio architecture: Route 53 resolves the domain to CloudFront, which reads static files from a private S3 origin using origin access control. ACM supplies the custom-domain certificate.",
      imageClass: "architecture-cover",
      tools: [
        "HTML",
        "CSS",
        "JavaScript",
        "Terraform",
        "Amazon S3",
        "Amazon CloudFront",
        "Amazon Route 53",
        "AWS Certificate Manager",
      ],
      problem:
        "I needed a place to present my cloud development and design work, while making the hosting itself a practical cloud project. The goal was a custom-domain website with HTTPS, controlled access to stored files, and infrastructure described in code rather than only configured through the console.",
      contribution:
        "My project brings together the personal portfolio, AWS hosting and domain setup. I chose the content and visual direction and use the site to connect my cloud development studies with my industrial design background. The front-end implementation and case-study writing were developed with AI assistance; the repository records the implementation, while the AWS hosting and Route 53 configuration were checked through the connected AWS account.",
      decisions:
        "A static front end keeps this portfolio simple: there is no application server or database to maintain. S3 stores the website files, while CloudFront is the public entry point. Terraform describes the hosting resources. Route 53 connects the domain to CloudFront through an alias record, and the custom-domain configuration accepts an ACM certificate in us-east-1.",
      implementation:
        "The interface uses plain HTML, CSS and JavaScript, with an optional bundled motion enhancement. content.js holds project entries and link destinations; main.js renders project overviews on the homepage and supports existing case-study URLs. Shared styles keep the pages consistent. Focus indicators, a skip link and reduced-motion rules support accessible interaction.",
      architecture: [
        "Browser requests abdullahiomer.com",
        "CloudFront receives the HTTPS request",
        "Origin access control signs requests to the private S3 origin",
        "S3 returns HTML, CSS, JavaScript and images",
      ],
      architectureNote:
        "DNS is a separate lookup: Route 53 resolves the domain to CloudFront. ACM provides the certificate used by CloudFront for the custom domain. Neither Route 53 nor ACM is an intermediate hop for the website files. The diagram reflects the repository configuration and my confirmed domain setup; it is not a live AWS inventory.",
      deployment:
        "AWS API reads on November 14, 2026 confirmed that abdullahiomer.com has Route 53 A and AAAA aliases targeting the enabled CloudFront distribution, an issued ACM certificate and a private S3 origin. main.tf sets the AWS provider region to us-east-1 and defines the S3 bucket, CloudFront distribution, origin access control and conditional Route 53 alias. For a custom-domain deployment, the configuration takes a hosted zone ID and an existing ACM certificate ARN. It references these resources rather than creating the hosted zone or certificate.",
      extraSections: [
        [
          "Access & security",
          "The S3 public-access block enables all four restrictions. The bucket policy grants s3:GetObject to the CloudFront service only when AWS:SourceArn matches this distribution. CloudFront uses the bucket regional REST endpoint, not the S3 website endpoint. The configuration signs origin requests with SigV4 and redirects viewer HTTP requests to HTTPS. The custom-domain branch selects TLSv1.2_2021. These are source-level settings; this page does not claim a live security audit.",
        ],
        [
          "Delivery & caching",
          "CloudFront enables compression and accepts GET, HEAD and OPTIONS, while caching GET and HEAD. The live distribution uses AWS’s managed CachingOptimized policy, which the reconciled Terraform configuration now references. Compression and the HTTP-to-HTTPS redirect were verified through the AWS API. The policy does not include cookies or query strings in its cache key. The project ID in a case-study URL is read by browser JavaScript, so it does not require a different cached HTML response for each ID.",
        ],
        [
          "Publishing process",
          "The new GitHub Actions workflow checks the site, packages only public files, assumes an AWS role through OIDC, uploads dependencies before entry pages, invalidates the live CloudFront cache and checks the deployed URLs. Pull requests run checks without deployment credentials; publishing is restricted to main. The scoped role and GitHub role-ARN variable are configured. The first GitHub Actions deployment completed successfully on November 15, 2026, including OIDC authentication, S3 uploads, CloudFront invalidation and public HTTPS checks.",
        ],
        [
          "Configuration limits",
          "AWS reads confirmed that the saved state refers to an older disabled distribution, while the domain uses a different active distribution. The configuration now matches the live Route 53 aliases, certificate, WAF association, origin ID and managed cache policy. Declarative imports adopt the active resources; a removed block releases the disabled distribution from state without deleting it. Terraform validation passes, but migration has not been applied because the local CLI credentials are invalid. A live plan must be reviewed before applying.",
        ],
        [
          "Validation",
          "Local Chrome checks at 1440, 390 and 320 pixels covered navigation, work filters, gallery buttons and arrow keys, case-study routes, reduced motion and the keyboard skip link. Touch-swipe scrolling and journal image loading were checked separately. JavaScript syntax checks passed. These browser checks cover the local front end. The November 15 GitHub Actions run separately passed AWS authentication, deployment and HTTPS checks for the homepage, cloud case study and shared assets. Those delivery checks are not a live security audit.",
        ],
        [
          "Monitoring",
          "A CloudWatch dashboard and a 5xx error-rate alarm were created in us-east-1 and read back through AWS. The dashboard shows request counts, 4xx/5xx rates, bytes downloaded and alarm status for the active distribution. The alarm watches for a 5xx rate above 5% in two of three five-minute periods, treats missing data as non-breaching, and has no SNS notification target. This is delivery monitoring, not an uptime guarantee.",
        ],
        [
          "Observed traffic",
          "For the seven-day query window ending November 14, 2026 at 19:46 UTC, CloudWatch returned 17,684 requests across its daily buckets. Each returned daily average 5xx rate was 0%. These are requests, not unique visitors, and a zero daily average must not be described as measured uptime. The snapshot is historical and is not refreshed in the browser.",
        ],
        [
          "Cost visibility",
          "Cost Explorer returned October 2026 account-wide service charges of USD 0.133642 for S3 and USD 0.000160 for CloudWatch, excluding credits and refunds. These are service excerpts, not a portfolio total: other projects can share these services, and omitted services are not assumed to cost zero. The Terraform providers now add a Project cost-allocation tag to supported resources on apply; it must also be activated in Billing before new tagged costs can be isolated. Dashboard, alarm and evidence-query charges may apply.",
        ],
        [
          "Delivery baseline",
          "Before publishing this version, an HTTPS request to the existing homepage returned HTTP 200, with a 0.324128-second time to first byte and a 0.335376-second total transfer time from this machine. The new case-study and asset URLs returned HTTP 403, so the deployment smoke check correctly failed. That November 14 result is retained as a pre-release baseline. After deployment on November 15, all five checked URLs returned HTTP 200; the GitHub runner recorded a 0.214359-second homepage time to first byte and a 0.214843-second total transfer time. These are individual curl samples from different runners and times, not Lighthouse scores or a controlled performance comparison.",
        ],
        [
          "Next steps",
          "Run and review the Terraform import plan with renewed local credentials. Use the successful November 15 workflow and its measurement artifact as deployment evidence, and keep future deployment records alongside the source. After Project cost-allocation tags are applied and activated, collect a new billing period for portfolio-specific cost reporting. An SNS target can be added for notifications; the current alarm exposes state without sending alerts.",
        ],
      ],
      lessons:
        "This project shows how several layers fit together: DNS finds the distribution, TLS protects the browser connection, CloudFront delivers content, and an origin policy controls access to S3. It also shows why working infrastructure and reproducible infrastructure are different: the saved state originally tracked a disabled distribution instead of the live one. Importing the correct resources is part of making the deployment reproducible. The successful GitHub Actions run verifies the delivery path. Terraform state reconciliation remains a separate unfinished step.",
      github: "https://github.com/abdullahi-17/website-portfolio",
      demo: "https://abdullahiomer.com",
      references: [
        [
          "Successful deployment: November 15, 2026",
          "https://github.com/abdullahi-17/website-portfolio/actions/runs/43687661256",
        ],
        [
          "AWS: Restrict access to an S3 origin",
          "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html",
        ],
        [
          "GitHub: OpenID Connect in AWS (OIDC deployment)",
          "https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws",
        ],
        [
          "AWS: Monitor CloudFront with CloudWatch (monitoring)",
          "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/monitoring-using-cloudwatch.html",
        ],
      ],
    },
    {
      id: "azure-retail-pipeline",
      category: "cloud",
      categoryLabel: "Cloud & Development",
      title: "Azure retail data pipeline",
      status: "School project / Team collaboration",
      description:
        "From five retail CSV files to a Power BI dashboard: an Azure data pipeline with typed SQL data, validation and documented error handling.",
      workOverview: [
        "Our CST8911 team used Azure Data Factory to load five CSV files from Blob Storage into Azure SQL. We cleaned and typed the data in SQL before exposing reporting views to Power BI.",
        "My documented contribution focused on Power BI relationships, DAX measures, and dashboard filters. I also used SQL to compare financial totals.",
      ],
      image: "assets/retail-dashboard.png",
      imageAlt:
        "Actual project Power BI dashboard with revenue and profit measures, monthly sales, country comparisons, and year and country filters.",
      imageClass: "dashboard-cover",
      tools: [
        "Azure Blob Storage",
        "Azure Data Factory",
        "Azure SQL Database",
        "T-SQL",
        "Power BI",
        "DAX",
      ],
      problem:
        "The Global Electronics Retailer dataset separates customers, products, stores, sales and exchange rates into CSV files. Our CST8911 midterm connected those files to a cloud data workflow so the team could clean the data, build a consistent SQL model and explore sales in Power BI.",
      contribution:
        "This was a team project. The repository documents my Power BI connection, model relationships, DAX measures, dashboard filters and SQL comparison of financial totals. The pipeline setup is described as shared work. The normalization scripts are credited to teammate Georges Ngepi in the SQL README; they are part of the team architecture rather than an individual authorship claim. This case-study summary was prepared with AI assistance from the repository evidence.",
      decisions:
        "The team used a private Blob container and Data Factory’s managed identity with Storage Blob Data Reader access, avoiding a storage key for the Blob connection. Raw values first entered NVARCHAR staging columns before type conversion. Power BI connected to prepared bi views instead of raw staging tables, with one-to-many relationships and single-direction filtering. These choices separate ingestion, data modelling and reporting.",
      implementation:
        "Each CSV had a Copy activity with explicit header-to-column mappings. Full loads cleared their staging tables first. T-SQL transformations trimmed text, converted dates and numeric values, cleaned currency-formatted prices and standardized currency codes. The team’s core load separated orders from order lines and normalized product and customer relationships. The bi.Sales view exposes revenue, cost, profit and local-currency revenue for the dashboard. DAX measures and Year/Country slicers provide the reporting layer.",
      architecture: [
        "Five source CSV files → Private Azure Blob container",
        "Azure Data Factory → Copy and transformation activities",
        "Azure SQL → staging tables → normalized core tables → bi views",
        "Power BI → Model relationships, DAX measures and interactive report",
      ],
      architectureLabel: "Data flow from source files to the Power BI report",
      deployment:
        "The project README places the Azure resources in Sweden Central because of student-subscription constraints, within one resource group. Blob access used managed identity; the Azure SQL connection used SQL authentication. The repository contains SQL scripts, a Power BI file and screenshots, rather than an exported Data Factory deployment or infrastructure-as-code template. No current live deployment or public dashboard was verified for this portfolio page.",
      extraSections: [
        [
          "Error handling",
          "The README describes transactions with TRY…CATCH, a pipeline failure path that records the run ID, activity, error message and time in dbo.PipelineErrors, and a Fail activity that keeps the pipeline marked as failed. It also records an intentional Products transformation error test in which existing product records were preserved. These are documented team checks; they were not rerun while preparing this case study.",
        ],
        [
          "A real data-quality issue",
          "The Customers CSV used ISO-8859-1 rather than UTF-8. The README describes changing the Data Factory source encoding after corrupted customer names were reported. The SQL README records the corrected result. This is a useful example of checking source encoding before treating unusual characters as a modelling problem.",
        ],
        [
          "Validation & results",
          "The SQL validation script checks 62,884 sales rows, 15,266 customers and total dataset revenue of USD 55,755,479.59. The saved Azure query screenshot shows 62,884 rows, 26,326 orders and a 58.58% profit margin; the dashboard displays matching rounded totals. These are historical dataset calculations, not revenue generated by the project or business impact achieved by the team.",
        ],
        [
          "Evidence & limits",
          "The cover is an actual screenshot from the project repository. The linked source contains the dashboard screenshots, SQL scripts and the .pbix report. This portfolio review checked those artifacts and documentation without reconnecting to Azure or running Power BI.",
        ],
        [
          "What I would improve",
          "Export and version the Data Factory pipeline and datasets, document deployment prerequisites, and automate the row-count and financial-total checks. Keep the team’s role attribution alongside the technical explanation so the work is easy to demonstrate and discuss.",
        ],
      ],
      lessons:
        "This project connects the reporting interface to the data work behind it. A dashboard depends on correct encodings, typed values, stable relationships and checks against the source. Keeping the ingestion, SQL modelling and presentation layers distinct makes it easier to trace a wrong number back to its cause.",
      github: "https://github.com/abdullahi-17/CST8911-Midterm",
      demo: null,
      demoNote: "No public demo / Report and screenshots in the repository",
      references: [
        [
          "Project README: pipeline and Power BI process",
          "https://github.com/abdullahi-17/CST8911-Midterm/blob/main/README.md",
        ],
        [
          "Team SQL model, attribution and recorded checks",
          "https://github.com/abdullahi-17/CST8911-Midterm/tree/main/SQL%20Scripts",
        ],
        [
          "Original dashboard screenshots",
          "https://github.com/abdullahi-17/CST8911-Midterm/tree/main/PowerBI%20screenshots",
        ],
      ],
    },
    {
      id: "spendwise",
      category: "cloud",
      categoryLabel: "Cloud & Development",
      url: "https://spendwise.abdullahiomer.com",
      title: "SpendWise",
      status: "Published browser demo / Simulated purchase",
      description:
        "A mindful-spending demo that lets visitors pause and reflect before a simulated purchase.",
      workOverview: [
        "The browser demo walks through a sample purchase and offers a reflection prompt. It runs in the browser using local rules and does not make purchases or save reflection history.",
        "The static site is delivered through S3 and CloudFront. The optional API Gateway and Lambda service is separate from the browser demo.",
      ],
      image: "assets/SpendWise Logo on White.png",
      imageAlt: "SpendWise logo with a navy and blue S, pause symbol and check mark on a white background.",
      imageClass: "spendwise-cover",
      sections: [
        [
          "Project status",
          "The published browser demo uses a sample purchase and local rules.",
        ],
        [
          "Scope",
          "The browser demo covers a short purchase reflection. The mobile application architecture is a separate design.",
        ],
        [
          "Optional API",
          "The optional API Gateway and Lambda service is not needed for the browser demo.",
        ],
      ],
      github: null,
      demo: "https://spendwise.abdullahiomer.com/demo.html",
      sourceNote: "Repository link available on the project site",
    },
  ],
};
