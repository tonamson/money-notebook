import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PvService } from './pv.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class PvNotificationService {
  private readonly logger = new Logger(PvNotificationService.name);
  private isProcessing = false;

  constructor(
    private readonly pvService: PvService,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotifications() {
    if (this.isProcessing) {
      this.logger.log('Previous job still running, skipping this cycle');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting notification job...');

    try {
      const unnotifiedParams = await this.pvService.getUnnotifiedParams();

      if (unnotifiedParams.length === 0) {
        this.logger.log('No unnotified params found');
        return;
      }

      this.logger.log(
        `Found ${unnotifiedParams.length} unnotified params. Sending notifications...`,
      );

      for (const pv of unnotifiedParams) {
        try {
          const success = await this.telegramService.sendParamNotification(
            pv.param,
            pv.id,
          );

          if (success) {
            await this.pvService.markAsNotified(pv.id);
            this.logger.log(`Notification sent for param ID: ${pv.id}`);
          } else {
            this.logger.warn(
              `Failed to send notification for param ID: ${pv.id}`,
            );
          }

          // Add a small delay between messages to avoid rate limiting
          await this.sleep(500);
        } catch (error) {
          this.logger.error(
            `Error processing param ID ${pv.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Notification job completed');
    } catch (error) {
      this.logger.error(`Error in notification job: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
