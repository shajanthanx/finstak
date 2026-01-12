import React from 'react';
import {
    Activity, Book, BookOpen, Brain, Briefcase, Calendar,
    CheckCircle, Clock, Cloud, Code, Coffee, Coins,
    CreditCard, Dumbbell, Eye, FileText, Flame, Gift,
    Globe, Heart, Home, Image, Key, Layers, Layout,
    Library, Lightbulb, Link, Lock, Map, MapPin,
    MessageCircle, Mic, Monitor, Moon, Music, Palette,
    Paperclip, Phone, Play, Plus, Power, Printer, Radio,
    RefreshCw, Repeat, Save, Search, Settings, Shield,
    ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker,
    Star, Sun, Tablet, Tag, Target, Terminal,
    Trash, TrendingUp, Trophy, Truck, Tv, Umbrella,
    User, Users, Video, Voicemail, Wifi, Zap,
    Pencil, Backpack, Calculator, Camera, Compass,
    Database, Disc, Droplets, Dumbbell as Gym,
    FastForward, File, Film, Flag, FlaskConical,
    Folder, Gamepad, Gamepad2, Ghost, GraduationCap,
    Hammer, Headphones, Inbox, Laptop, Leaf,
    List, Mail, Menu, MessageSquare, Mouse,
    Package, PenTool, PieChart, Plane, Rocket,
    Scissors, Server, Share, Shirt, Sidebar,
    Signal, Snowflake, Sparkles, StopCircle,
    Thermometer, ThumbsUp, Timer, ToggleLeft,
    Trash2, Triangle, Truck as Lorry, Type,
    Upload, Volume, Wallet, Watch, Wrench, X
} from 'lucide-react';

export const availableIcons = [
    { name: "Activity", icon: Activity },
    { name: "Book", icon: Book },
    { name: "Brain", icon: Brain },
    { name: "Briefcase", icon: Briefcase },
    { name: "Coffee", icon: Coffee },
    { name: "Coins", icon: Coins },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Eye", icon: Eye },
    { name: "FileText", icon: FileText },
    { name: "Flame", icon: Flame },
    { name: "Globe", icon: Globe },
    { name: "Heart", icon: Heart },
    { name: "Home", icon: Home },
    { name: "Laptop", icon: Laptop },
    { name: "Leaf", icon: Leaf },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Moon", icon: Moon },
    { name: "Music", icon: Music },
    { name: "Palette", icon: Palette },
    { name: "Plane", icon: Plane },
    { name: "Rocket", icon: Rocket },
    { name: "ShoppingBag", icon: ShoppingBag },
    { name: "Smile", icon: Smile },
    { name: "Star", icon: Star },
    { name: "Sun", icon: Sun },
    { name: "Target", icon: Target },
    { name: "Trophy", icon: Trophy },
    { name: "Zap", icon: Zap },
    { name: "Droplets", icon: Droplets },
    { name: "Gamepad", icon: Gamepad2 },
    { name: "GraduationCap", icon: GraduationCap },
    { name: "Headphones", icon: Headphones },
    { name: "Sparkles", icon: Sparkles },
    { name: "Timer", icon: Timer },
    { name: "Wallet", icon: Wallet },
    { name: "Wrench", icon: Wrench },
    { name: "Pencil", icon: Pencil },
    { name: "Calendar", icon: Calendar },
    { name: "Clock", icon: Clock },
    { name: "Code", icon: Code },
];

export const getIcon = (iconName: string, className?: string) => {
    const iconEntry = availableIcons.find(i => i.name === iconName);

    // If found, render it
    if (iconEntry) {
        const IconComponent = iconEntry.icon;
        return <IconComponent className={className} />;
    }

    // Fallback: If it's a legacy emoji (length <= 2 usually), render as text
    if (iconName && iconName.length <= 4 && !iconName.includes(' ')) {
        return <span className={className}>{iconName}</span>;
    }

    // Default Fallback
    return <Activity className={className} />;
};
