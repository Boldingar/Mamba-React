import axios from "../utils/axios";

export interface Product {
  url: string;
  name: string;
  language: string;
  priority: number;
  description: string;
}

export interface Persona {
  name: string;
  description: string;
  priority: number;
}

export interface Competitor {
  name: string;
  description: string;
}

export interface ProjectData {
  name: string;
  website_url: string;
  target_market: string;
  products: Product[];
  personas: Persona[];
  competitors: Competitor[];
  company_summary: string;
}

export interface ProjectAnalysisResponse {
  products: Product[];
  personas: Persona[];
  competitors: Competitor[];
  company_summary: string;
}

export const analyzeWebsite = async (
  websiteUrl: string
): Promise<ProjectAnalysisResponse> => {
  const response = await axios.post<ProjectAnalysisResponse>("/project-data", {
    project_url: websiteUrl,
  });
  return response.data;
};

export const createProject = async (
  projectData: ProjectData
): Promise<void> => {
  await axios.post("/projects", {
    name: projectData.name,
    website_url: projectData.website_url,
    project_data: {
      products: projectData.products,
      personas: projectData.personas,
      competitors: projectData.competitors,
      company_summary: projectData.company_summary,
    },
  });
};
