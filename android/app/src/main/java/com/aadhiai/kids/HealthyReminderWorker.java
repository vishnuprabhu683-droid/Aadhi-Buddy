
package com.aadhiai.kids;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class HealthyReminderWorker extends Worker {

    private static final String CHANNEL_ID = "aadhi_healthy_reminders";

    public HealthyReminderWorker(
            Context context,
            WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        Context context = getApplicationContext();

        createNotificationChannel(context);

        if (Build.VERSION.SDK_INT >= 33 &&
                ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED) {
            return Result.success();
        }

        if (!NotificationManagerCompat.from(context)
                .areNotificationsEnabled()) {
            return Result.success();
        }

        String title = getInputData().getString("title");
        String message = getInputData().getString("message");

        if (title == null) {
            title = "Aadhi AI Reminder";
        }

        if (message == null) {
            message = "Time to drink some water! 💧";
        }

        NotificationCompat.Builder notification =
                new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle()
                        .bigText(message))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true);

        NotificationManagerCompat.from(context)
                .notify((int) System.currentTimeMillis(),
                        notification.build());

        return Result.success();
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel =
                    new NotificationChannel(
                        CHANNEL_ID,
                        "Aadhi Healthy Reminders",
                        NotificationManager.IMPORTANCE_DEFAULT
                    );

            channel.setDescription(
                    "Water and healthy habit reminders"
            );

            NotificationManager manager =
                    context.getSystemService(NotificationManager.class);

            manager.createNotificationChannel(channel);
        }
    }
}
