// This would be replaced with actual API calls in a production environment
export const generateLearningPathway = async topic => {
    // Simulate API call
    const response = await simulateApiCall(topic)
    return response
  }
  
  // Mock function to simulate API response
  const simulateApiCall = async topic => {
    // In a real implementation, this would call the Gemini API with a prompt like:
    // "Create a learning pathway for {topic} with different levels of skills and concepts to master"
  
    return new Promise(resolve => {
      setTimeout(() => {
        // Return different pathway structures based on the topic
        if (topic.toLowerCase().includes("cloud")) {
          resolve(getCloudPathway(topic))
        } else if (topic.toLowerCase().includes("data")) {
          resolve(getDataSciencePathway(topic))
        } else if (
          topic.toLowerCase().includes("web") ||
          topic.toLowerCase().includes("front")
        ) {
          resolve(getWebDevPathway(topic))
        } else if (
          topic.toLowerCase().includes("cyber") ||
          topic.toLowerCase().includes("security")
        ) {
          resolve(getCyberSecurityPathway(topic))
        } else if (
          topic.toLowerCase().includes("ai") ||
          topic.toLowerCase().includes("machine")
        ) {
          resolve(getAIPathway(topic))
        } else {
          resolve(getGenericPathway(topic))
        }
      }, 1500)
    })
  }
  
  const getCloudPathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: "Cloud Computing Fundamentals",
          level: 0,
          color: "#f9a8d4",
          children: ["iaas", "paas", "saas", "security", "networking"]
        },
        {
          id: "iaas",
          label: "Infrastructure as a Service (IaaS)",
          level: 1,
          color: "#fde68a",
          children: ["compute", "storage"]
        },
        {
          id: "paas",
          label: "Platform as a Service (PaaS)",
          level: 1,
          color: "#fde68a",
          children: ["containers", "serverless"]
        },
        {
          id: "saas",
          label: "Software as a Service (SaaS)",
          level: 1,
          color: "#fde68a"
        },
        {
          id: "security",
          label: "Cloud Security",
          level: 1,
          color: "#fde68a",
          children: ["identity", "compliance"]
        },
        {
          id: "networking",
          label: "Cloud Networking",
          level: 1,
          color: "#fde68a",
          children: ["vpc", "cdn"]
        },
        {
          id: "compute",
          label: "Compute Services",
          level: 2,
          color: "#a7f3d0",
          children: ["ec2", "autoscaling"]
        },
        {
          id: "storage",
          label: "Storage Solutions",
          level: 2,
          color: "#a7f3d0",
          children: ["block", "object"]
        },
        {
          id: "containers",
          label: "Container Orchestration",
          level: 2,
          color: "#a7f3d0",
          children: ["kubernetes"]
        },
        {
          id: "serverless",
          label: "Serverless Computing",
          level: 2,
          color: "#a7f3d0",
          children: ["lambda"]
        },
        {
          id: "identity",
          label: "Identity & Access Management",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "compliance",
          label: "Regulatory Compliance",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "vpc",
          label: "Virtual Private Clouds",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "cdn",
          label: "Content Delivery Networks",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "ec2",
          label: "Virtual Machines",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "autoscaling",
          label: "Auto Scaling Groups",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "block",
          label: "Block Storage",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "object",
          label: "Object Storage",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "kubernetes",
          label: "Kubernetes & Docker",
          level: 3,
          color: "#bfdbfe",
          children: ["devops"]
        },
        {
          id: "lambda",
          label: "Function as a Service (FaaS)",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "devops",
          label: "DevOps Practices",
          level: 4,
          color: "#ddd6fe",
          children: ["cicd"]
        },
        {
          id: "cicd",
          label: "CI/CD Pipelines",
          level: 5,
          color: "#fbcfe8"
        }
      ]
    }
  }
  
  const getDataSciencePathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: "Data Science Fundamentals",
          level: 0,
          color: "#f9a8d4",
          children: ["stats", "programming", "databases", "viz", "ml"]
        },
        {
          id: "stats",
          label: "Statistics & Mathematics",
          level: 1,
          color: "#fde68a",
          children: ["prob", "linear-algebra", "calculus"]
        },
        {
          id: "programming",
          label: "Programming for Data Science",
          level: 1,
          color: "#fde68a",
          children: ["python", "r", "sql"]
        },
        {
          id: "databases",
          label: "Database Systems",
          level: 1,
          color: "#fde68a",
          children: ["relational", "nosql"]
        },
        {
          id: "viz",
          label: "Data Visualization",
          level: 1,
          color: "#fde68a",
          children: ["viz-tools", "storytelling"]
        },
        {
          id: "ml",
          label: "Machine Learning",
          level: 1,
          color: "#fde68a",
          children: ["supervised", "unsupervised", "deep-learning"]
        },
        {
          id: "prob",
          label: "Probability Theory",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "linear-algebra",
          label: "Linear Algebra",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "calculus",
          label: "Calculus & Optimization",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "python",
          label: "Python & Libraries",
          level: 2,
          color: "#a7f3d0",
          children: ["pandas", "numpy"]
        },
        {
          id: "r",
          label: "R Programming",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "sql",
          label: "SQL & Query Optimization",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "relational",
          label: "Relational Databases",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "nosql",
          label: "NoSQL Databases",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "viz-tools",
          label: "Visualization Tools",
          level: 2,
          color: "#a7f3d0",
          children: ["tableau", "powerbi"]
        },
        {
          id: "storytelling",
          label: "Data Storytelling",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "supervised",
          label: "Supervised Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["classification", "regression"]
        },
        {
          id: "unsupervised",
          label: "Unsupervised Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["clustering"]
        },
        {
          id: "deep-learning",
          label: "Deep Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["neural-networks"]
        },
        {
          id: "pandas",
          label: "Pandas & Data Wrangling",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "numpy",
          label: "NumPy & Scientific Computing",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "tableau",
          label: "Tableau",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "powerbi",
          label: "Power BI",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "classification",
          label: "Classification Algorithms",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "regression",
          label: "Regression Algorithms",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "clustering",
          label: "Clustering Techniques",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "neural-networks",
          label: "Neural Networks",
          level: 3,
          color: "#bfdbfe",
          children: ["cnn", "rnn"]
        },
        {
          id: "cnn",
          label: "Convolutional Neural Networks",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "rnn",
          label: "Recurrent Neural Networks",
          level: 4,
          color: "#ddd6fe"
        }
      ]
    }
  }
  
  const getWebDevPathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: "Web Development",
          level: 0,
          color: "#f9a8d4",
          children: ["frontend", "backend", "databases", "deployment"]
        },
        {
          id: "frontend",
          label: "Frontend Development",
          level: 1,
          color: "#fde68a",
          children: ["html-css", "javascript", "frameworks"]
        },
        {
          id: "backend",
          label: "Backend Development",
          level: 1,
          color: "#fde68a",
          children: ["server-languages", "apis", "auth"]
        },
        {
          id: "databases",
          label: "Database Design",
          level: 1,
          color: "#fde68a",
          children: ["sql-db", "nosql-db"]
        },
        {
          id: "deployment",
          label: "Deployment & DevOps",
          level: 1,
          color: "#fde68a",
          children: ["hosting", "ci-cd", "containers"]
        },
        {
          id: "html-css",
          label: "HTML & CSS",
          level: 2,
          color: "#a7f3d0",
          children: ["responsive", "sass"]
        },
        {
          id: "javascript",
          label: "JavaScript",
          level: 2,
          color: "#a7f3d0",
          children: ["dom", "es6", "typescript"]
        },
        {
          id: "frameworks",
          label: "Frontend Frameworks",
          level: 2,
          color: "#a7f3d0",
          children: ["react", "vue", "angular"]
        },
        {
          id: "server-languages",
          label: "Server Languages",
          level: 2,
          color: "#a7f3d0",
          children: ["nodejs", "python", "java"]
        },
        {
          id: "apis",
          label: "API Development",
          level: 2,
          color: "#a7f3d0",
          children: ["rest", "graphql"]
        },
        {
          id: "auth",
          label: "Authentication & Security",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "sql-db",
          label: "SQL Databases",
          level: 2,
          color: "#a7f3d0",
          children: ["postgres", "mysql"]
        },
        {
          id: "nosql-db",
          label: "NoSQL Databases",
          level: 2,
          color: "#a7f3d0",
          children: ["mongodb", "firebase"]
        },
        {
          id: "hosting",
          label: "Web Hosting",
          level: 2,
          color: "#a7f3d0",
          children: ["cloud-platforms"]
        },
        {
          id: "ci-cd",
          label: "CI/CD Pipelines",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "containers",
          label: "Containerization",
          level: 2,
          color: "#a7f3d0",
          children: ["docker", "kubernetes"]
        },
        {
          id: "responsive",
          label: "Responsive Design",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "sass",
          label: "SASS/SCSS",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "dom",
          label: "DOM Manipulation",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "es6",
          label: "ES6+ Features",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "typescript",
          label: "TypeScript",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "react",
          label: "React.js",
          level: 3,
          color: "#bfdbfe",
          children: ["next-js"]
        },
        {
          id: "vue",
          label: "Vue.js",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "angular",
          label: "Angular",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "nodejs",
          label: "Node.js",
          level: 3,
          color: "#bfdbfe",
          children: ["express"]
        },
        {
          id: "python",
          label: "Python Backend",
          level: 3,
          color: "#bfdbfe",
          children: ["django", "flask"]
        },
        {
          id: "java",
          label: "Java Backend",
          level: 3,
          color: "#bfdbfe",
          children: ["spring"]
        },
        {
          id: "rest",
          label: "RESTful APIs",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "graphql",
          label: "GraphQL",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "postgres",
          label: "PostgreSQL",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "mysql",
          label: "MySQL",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "mongodb",
          label: "MongoDB",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "firebase",
          label: "Firebase",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "cloud-platforms",
          label: "Cloud Platforms",
          level: 3,
          color: "#bfdbfe",
          children: ["aws", "azure", "gcp"]
        },
        {
          id: "docker",
          label: "Docker",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "kubernetes",
          label: "Kubernetes",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "next-js",
          label: "Next.js",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "express",
          label: "Express.js",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "django",
          label: "Django",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "flask",
          label: "Flask",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "spring",
          label: "Spring Boot",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "aws",
          label: "AWS",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "azure",
          label: "Azure",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "gcp",
          label: "Google Cloud",
          level: 4,
          color: "#ddd6fe"
        }
      ]
    }
  }
  
  const getCyberSecurityPathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: "Cybersecurity",
          level: 0,
          color: "#f9a8d4",
          children: ["network", "app_sec", "data_sec", "identity", "compliance"]
        },
        {
          id: "network",
          label: "Network Security",
          level: 1,
          color: "#fde68a",
          children: ["firewalls", "ids_ips", "vpn"]
        },
        {
          id: "app_sec",
          label: "Application Security",
          level: 1,
          color: "#fde68a",
          children: ["web_sec", "mobile_sec", "code_review"]
        },
        {
          id: "data_sec",
          label: "Data Security",
          level: 1,
          color: "#fde68a",
          children: ["encryption", "dlp", "db_sec"]
        },
        {
          id: "identity",
          label: "Identity & Access Management",
          level: 1,
          color: "#fde68a",
          children: ["auth", "privileges", "mfa"]
        },
        {
          id: "compliance",
          label: "Security Compliance",
          level: 1,
          color: "#fde68a",
          children: ["gdpr", "iso", "auditing"]
        },
        {
          id: "firewalls",
          label: "Firewalls & Network Filtering",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "ids_ips",
          label: "Intrusion Detection/Prevention",
          level: 2,
          color: "#a7f3d0",
          children: ["siem"]
        },
        {
          id: "vpn",
          label: "VPN & Secure Communications",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "web_sec",
          label: "Web Application Security",
          level: 2,
          color: "#a7f3d0",
          children: ["owasp", "waf"]
        },
        {
          id: "mobile_sec",
          label: "Mobile Security",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "code_review",
          label: "Secure Code Review",
          level: 2,
          color: "#a7f3d0",
          children: ["sast", "dast"]
        },
        {
          id: "encryption",
          label: "Encryption Technologies",
          level: 2,
          color: "#a7f3d0",
          children: ["crypto"]
        },
        {
          id: "dlp",
          label: "Data Loss Prevention",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "db_sec",
          label: "Database Security",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "auth",
          label: "Authentication Systems",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "privileges",
          label: "Privilege Management",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "mfa",
          label: "Multi-Factor Authentication",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "gdpr",
          label: "GDPR & Privacy Regulations",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "iso",
          label: "ISO 27001 & Security Standards",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "auditing",
          label: "Security Auditing",
          level: 2,
          color: "#a7f3d0",
          children: ["pentest"]
        },
        {
          id: "siem",
          label: "Security Information & Event Management",
          level: 3,
          color: "#bfdbfe",
          children: ["threat_intel"]
        },
        {
          id: "owasp",
          label: "OWASP Top 10",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "waf",
          label: "Web Application Firewalls",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "sast",
          label: "Static Application Security Testing",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "dast",
          label: "Dynamic Application Security Testing",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "crypto",
          label: "Applied Cryptography",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "pentest",
          label: "Penetration Testing",
          level: 3,
          color: "#bfdbfe",
          children: ["red_team"]
        },
        {
          id: "threat_intel",
          label: "Threat Intelligence",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "red_team",
          label: "Red Team Operations",
          level: 4,
          color: "#ddd6fe",
          children: ["purple_team"]
        },
        {
          id: "purple_team",
          label: "Purple Team Exercises",
          level: 5,
          color: "#fbcfe8"
        }
      ]
    }
  }
  
  const getAIPathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: "Artificial Intelligence",
          level: 0,
          color: "#f9a8d4",
          children: ["ml", "dl", "nlp", "cv", "rl"]
        },
        {
          id: "ml",
          label: "Machine Learning",
          level: 1,
          color: "#fde68a",
          children: ["supervised", "unsupervised", "math"]
        },
        {
          id: "dl",
          label: "Deep Learning",
          level: 1,
          color: "#fde68a",
          children: ["nn", "cnn", "rnn"]
        },
        {
          id: "nlp",
          label: "Natural Language Processing",
          level: 1,
          color: "#fde68a",
          children: ["text_process", "llm"]
        },
        {
          id: "cv",
          label: "Computer Vision",
          level: 1,
          color: "#fde68a",
          children: ["image_process", "object_detect"]
        },
        {
          id: "rl",
          label: "Reinforcement Learning",
          level: 1,
          color: "#fde68a",
          children: ["q_learning", "policy_grad"]
        },
        {
          id: "supervised",
          label: "Supervised Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["regression", "classification"]
        },
        {
          id: "unsupervised",
          label: "Unsupervised Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["clustering", "dim_reduction"]
        },
        {
          id: "math",
          label: "Mathematical Foundations",
          level: 2,
          color: "#a7f3d0",
          children: ["linear_algebra", "calculus", "probability"]
        },
        {
          id: "nn",
          label: "Neural Networks Fundamentals",
          level: 2,
          color: "#a7f3d0",
          children: ["backprop"]
        },
        {
          id: "cnn",
          label: "Convolutional Neural Networks",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "rnn",
          label: "Recurrent Neural Networks",
          level: 2,
          color: "#a7f3d0",
          children: ["lstm", "gru"]
        },
        {
          id: "text_process",
          label: "Text Processing",
          level: 2,
          color: "#a7f3d0",
          children: ["tokenization", "embeddings"]
        },
        {
          id: "llm",
          label: "Large Language Models",
          level: 2,
          color: "#a7f3d0",
          children: ["transformers"]
        },
        {
          id: "image_process",
          label: "Image Processing",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "object_detect",
          label: "Object Detection",
          level: 2,
          color: "#a7f3d0",
          children: ["rcnn", "yolo"]
        },
        {
          id: "q_learning",
          label: "Q-Learning",
          level: 2,
          color: "#a7f3d0",
          children: ["dqn"]
        },
        {
          id: "policy_grad",
          label: "Policy Gradient Methods",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "regression",
          label: "Regression Algorithms",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "classification",
          label: "Classification Algorithms",
          level: 3,
          color: "#bfdbfe",
          children: ["svm", "random_forest"]
        },
        {
          id: "clustering",
          label: "Clustering Algorithms",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "dim_reduction",
          label: "Dimensionality Reduction",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "linear_algebra",
          label: "Linear Algebra",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "calculus",
          label: "Calculus & Optimization",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "probability",
          label: "Probability & Statistics",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "backprop",
          label: "Backpropagation",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "lstm",
          label: "LSTM Networks",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "gru",
          label: "GRU Networks",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "tokenization",
          label: "Tokenization Techniques",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "embeddings",
          label: "Word & Sentence Embeddings",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "transformers",
          label: "Transformer Models",
          level: 3,
          color: "#bfdbfe",
          children: ["bert", "gpt"]
        },
        {
          id: "rcnn",
          label: "R-CNN Family",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "yolo",
          label: "YOLO Models",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "dqn",
          label: "Deep Q-Networks",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "svm",
          label: "Support Vector Machines",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "random_forest",
          label: "Random Forests",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "bert",
          label: "BERT & Variants",
          level: 4,
          color: "#ddd6fe"
        },
        {
          id: "gpt",
          label: "GPT & Generative Models",
          level: 4,
          color: "#ddd6fe",
          children: ["fine_tuning"]
        },
        {
          id: "fine_tuning",
          label: "Fine-tuning Strategies",
          level: 5,
          color: "#fbcfe8"
        }
      ]
    }
  }
  
  const getGenericPathway = topic => {
    return {
      topic,
      nodes: [
        {
          id: "root",
          label: topic,
          level: 0,
          color: "#f9a8d4",
          children: [
            "fundamentals",
            "intermediate",
            "advanced",
            "specialized",
            "tools"
          ]
        },
        {
          id: "fundamentals",
          label: "Fundamentals",
          level: 1,
          color: "#fde68a",
          children: ["basics", "concepts"]
        },
        {
          id: "intermediate",
          label: "Intermediate Skills",
          level: 1,
          color: "#fde68a",
          children: ["practical", "techniques"]
        },
        {
          id: "advanced",
          label: "Advanced Topics",
          level: 1,
          color: "#fde68a",
          children: ["innovation", "optimization"]
        },
        {
          id: "specialized",
          label: "Specialized Knowledge",
          level: 1,
          color: "#fde68a",
          children: ["niche", "expert"]
        },
        {
          id: "tools",
          label: "Industry Tools",
          level: 1,
          color: "#fde68a",
          children: ["software", "platforms"]
        },
        {
          id: "basics",
          label: "Core Basics",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "concepts",
          label: "Key Concepts",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "practical",
          label: "Practical Applications",
          level: 2,
          color: "#a7f3d0",
          children: ["case_studies"]
        },
        {
          id: "techniques",
          label: "Common Techniques",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "innovation",
          label: "Innovative Approaches",
          level: 2,
          color: "#a7f3d0",
          children: ["research"]
        },
        {
          id: "optimization",
          label: "Optimization Methods",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "niche",
          label: "Niche Applications",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "expert",
          label: "Expert-Level Knowledge",
          level: 2,
          color: "#a7f3d0",
          children: ["certification"]
        },
        {
          id: "software",
          label: "Software Tools",
          level: 2,
          color: "#a7f3d0",
          children: ["open_source", "commercial"]
        },
        {
          id: "platforms",
          label: "Industry Platforms",
          level: 2,
          color: "#a7f3d0"
        },
        {
          id: "case_studies",
          label: "Real-world Case Studies",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "research",
          label: "Current Research",
          level: 3,
          color: "#bfdbfe",
          children: ["papers"]
        },
        {
          id: "certification",
          label: "Professional Certifications",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "open_source",
          label: "Open Source Tools",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "commercial",
          label: "Commercial Software",
          level: 3,
          color: "#bfdbfe"
        },
        {
          id: "papers",
          label: "Academic Papers",
          level: 4,
          color: "#ddd6fe",
          children: ["conferences"]
        },
        {
          id: "conferences",
          label: "Industry Conferences",
          level: 5,
          color: "#fbcfe8"
        }
      ]
    }
  }