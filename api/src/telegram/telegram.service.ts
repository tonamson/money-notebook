import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly telegramApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(message: string): Promise<boolean> {
    try {
      if (!this.botToken || !this.chatId) {
        this.logger.warn(
          'Telegram bot token or chat ID not configured. Skipping notification.',
        );
        return false;
      }

      const url = `${this.telegramApiUrl}/sendMessage`;
      const response = await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      );

      if (response.data.ok) {
        this.logger.log(`Message sent successfully to Telegram group`);
        return true;
      } else {
        this.logger.error(
          `Failed to send message: ${JSON.stringify(response.data)}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(`Error sending message to Telegram: ${error.message}`);
      return false;
    }
  }

  async sendParamNotification(param: string, id: number): Promise<boolean> {
    const decodedParam = Buffer.from(param, 'base64').toString('utf-8');
    const message = `
🔔 <b>New Param Notification</b>

<b>ID:</b> ${id}
<b>Param:</b> <code>${decodedParam}</code>
<b>Time:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
    `.trim();

    return this.sendMessage(message);
  }
}
