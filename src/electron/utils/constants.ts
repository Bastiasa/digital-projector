const {
    ENV_MODE    
} = process.env;

export const IS_DEVELOPMENT = ENV_MODE === 'development';