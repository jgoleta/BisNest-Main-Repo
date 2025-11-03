import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='date_added',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
