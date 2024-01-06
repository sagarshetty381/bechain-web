import { useNavigate } from "react-router-dom";

interface IErrResponse {
    success: boolean,
    status: number,
    message: string,
    error: boolean
}

class CommonService {

    isValidJSON(value: string) {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    public handleFailure(err: IErrResponse) {
        switch (err.status) {
            case 401:
                window.location.assign('/login');
                break;
            default:
        }
        throw err;
    }

    public getRandomQuestions() {
        const questions = [
            "What's your favorite way to spend a lazy Sunday?",
            "If you could travel anywhere in the world, where would you go first?",
            "What's the most memorable book you've ever read?",
            "Do you have any favorite hobbies or activities?",
            "What's your go-to comfort food?",
            "If you could have dinner with any historical figure, who would it be and why?",
            "What's the last movie or TV show that made you laugh out loud?",
            "What's something on your bucket list that you haven't done yet?",
            "How do you handle stress or difficult situations?",
            "What's your favorite type of music or favorite band?",
            "If you could have any superpower, what would it be?",
            "Are you a morning person or a night owl?",
            "What's your idea of the perfect weekend getaway?",
            "Do you have a favorite quote or mantra that inspires you?",
            "What's your proudest accomplishment so far?",
            "What's the most adventurous thing you've ever done?",
            "How do you like to stay active or fit?",
            "Are you a pet person? Do you have any pets?",
            "What's the most interesting place you've ever visited?",
            "If you could learn any skill instantly, what would it be?",
            "What's your favorite season, and why?",
            "How do you define success in your life?",
            "What's a skill or talent you have that not many people know about?",
            "Do you prefer city life, suburbs, or the countryside?",
            "What's your favorite type of cuisine or favorite dish?",
            "What's your favorite way to unwind after a long day?",
            "If you could have dinner with three fictional characters, who would they be?",
            "What's the most valuable lesson you've learned from a past relationship?",
            "What's your dream job or career?",
            "What's your philosophy on life?",
            "How do you handle disagreements or conflicts in a relationship?",
            "What's the last thing that made you genuinely excited?",
            "What's your favorite childhood memory?",
            "Do you have any favorite traditions or rituals?",
            "What's something you've always wanted to try but haven't had the chance to yet?",
            "What qualities do you value most in a friend?",
            "If you could change one thing about the world, what would it be?",
            "What's your favorite way to show kindness or make someone's day better?",
            "How do you stay motivated and focused on your goals?",
            "What's your favorite type of conversation, and what topics do you enjoy discussing the most?"
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    }
}

export default new CommonService();