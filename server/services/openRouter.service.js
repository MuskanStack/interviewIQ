import axios from "axios"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildAiError = (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const detail = responseData?.error?.message || responseData?.message || error?.message || "AI service request failed.";

    let message = "AI service failed unexpectedly. Please try again.";
    let statusCode = 502;

    if (error?.message === "AI returned empty response.") {
        message = "AI service returned an empty response. Please try again.";
        statusCode = 502;
    } else if (status === 401 || status === 403) {
        message = "AI authentication failed. Please check the API key configuration.";
        statusCode = 502;
    } else if (status === 402) {
        message = "AI quota is exhausted. Please try again later or contact support.";
        statusCode = 429;
    } else if (status === 429) {
        message = "AI rate limit reached. Please try again in a few moments.";
        statusCode = 429;
    } else if (status === 400) {
        message = "AI request was invalid. Please try again.";
        statusCode = 400;
    } else if ([500, 502, 503, 504].includes(status)) {
        message = "AI service is temporarily unavailable. Please try again shortly.";
        statusCode = 503;
    } else if (error?.code && ["ECONNABORTED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT"].includes(error.code)) {
        message = "AI service could not be reached. Please try again shortly.";
        statusCode = 503;
    }

    const normalizedError = new Error(message);
    normalizedError.statusCode = statusCode;
    normalizedError.code = error?.code;
    normalizedError.cause = error;
    normalizedError.details = detail;

    return normalizedError;
};

export const askAi = async (messages, retries = 1) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        const error = new Error("Messages array is empty.");
        error.statusCode = 400;
        throw error;
    }

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "openai/gpt-4o-mini",
                    messages,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const content = response?.data?.choices?.[0]?.message?.content;

            if (!content || !content.trim()) {
                throw new Error("AI returned empty response.");
            }

            return content;
        } catch (error) {
            lastError = error;
            const status = error?.response?.status;
            const shouldRetry = attempt < retries && [429, 500, 502, 503, 504].includes(status);

            if (!shouldRetry) {
                break;
            }

            await sleep(800 * (attempt + 1));
        }
    }

    console.error("OpenRouter Error:", {
        status: lastError?.response?.status,
        detail: lastError?.response?.data || lastError?.message,
    });

    throw buildAiError(lastError);
};