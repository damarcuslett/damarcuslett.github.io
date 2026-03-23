#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename;
use POSIX ();

my $port = 8080;
my $root = $ARGV[0] // dirname(__FILE__);
$root =~ s|[\\/]$||;  # strip trailing slash

my %mime = (
    html  => 'text/html; charset=utf-8',
    css   => 'text/css',
    js    => 'application/javascript',
    svg   => 'image/svg+xml',
    png   => 'image/png',
    jpg   => 'image/jpeg',
    ico   => 'image/x-icon',
);

my $server = IO::Socket::INET->new(
    LocalAddr => '127.0.0.1',
    LocalPort => $port,
    Proto     => 'tcp',
    Listen    => 10,
    ReuseAddr => 1,
) or die "Cannot bind port $port: $!\n";

print "Serving $root on http://localhost:$port\n";
$| = 1;

while (my $client = $server->accept()) {
    my $request = '';
    while (my $line = <$client>) {
        $request .= $line;
        last if $line =~ /^\r?\n$/;
    }
    my ($method, $path) = $request =~ /^(\w+)\s+(\S+)/;
    $path //= '/';
    $path =~ s/\?.*//;
    $path = '/index.html' if $path eq '/';
    $path =~ s|/|\\|g if $^O eq 'MSWin32';
    my $file = $root . $path;
    $file =~ s|/|\\|g if $^O eq 'MSWin32';

    if (-f $file) {
        my ($ext) = $file =~ /\.(\w+)$/;
        my $ct = $mime{lc($ext // '')} // 'application/octet-stream';
        open my $fh, '<:raw', $file or do {
            print $client "HTTP/1.1 500 Error\r\nConnection: close\r\n\r\n";
            close $client; next;
        };
        local $/;
        my $body = <$fh>;
        close $fh;
        print $client "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: " . length($body) . "\r\nConnection: close\r\n\r\n$body";
    } else {
        print $client "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n404 Not Found";
    }
    close $client;
}
