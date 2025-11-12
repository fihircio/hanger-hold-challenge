<?php

use DI\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Psr\Container\ContainerInterface;

return [
    'db' => function (ContainerInterface $container) {
        $capsule = new Capsule;
        
        $config = require __DIR__ . '/../config/database.php';
        $connection = $config['connections'][$config['default']];
        
        if ($connection['driver'] === 'sqlite') {
            $capsule->addConnection([
                'driver' => 'sqlite',
                'database' => $connection['database'],
                'prefix' => $connection['prefix'],
                'foreign_key_constraints' => $connection['foreign_key_constraints'] ?? false,
            ]);
        } else {
            $capsule->addConnection([
                'driver' => $connection['driver'],
                'host' => $connection['host'],
                'port' => $connection['port'],
                'database' => $connection['database'],
                'username' => $connection['username'],
                'password' => $connection['password'],
                'charset' => $connection['charset'],
                'collation' => $connection['collation'],
                'prefix' => $connection['prefix'],
            ]);
        }
        
        $capsule->setAsGlobal();
        $capsule->bootEloquent();
        
        return $capsule;
    },
    
    'logger' => function (ContainerInterface $container) {
        $logger = new Monolog\Logger('hanger-challenge');
        $logger->pushHandler(new Monolog\Handler\StreamHandler('php://stdout', Monolog\Logger::DEBUG));
        return $logger;
    },
];