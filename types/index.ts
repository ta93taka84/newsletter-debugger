export type Severity = 'critical' | 'warning' | 'info';

export interface AnalysisError {
    id: string;
    severity: Severity;
    message: string;
    line?: number;
    tag?: string;
    snippet?: string;
}

export interface AnalysisResult {
    score: number;
    sizeInBytes: number;
    errors: AnalysisError[];
    images: {
        src: string;
        alt: string;
        width?: string;
        height?: string;
    }[];
    links: {
        href: string;
        text: string;
        status?: number;
    }[];
}
