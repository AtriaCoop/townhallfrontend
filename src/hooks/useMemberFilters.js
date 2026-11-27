import { useMemo } from 'react';

const useMemberFilters = (members, searchMember, selectedTags) => {

    // Filter members by search query and selected tags
    const filteredMembers = useMemo(() => {
        let result = members;

        if (searchMember.trim()) {
            const search = searchMember.toLowerCase();

            result = result.filter(member =>
                member.name.toLowerCase().includes(search)
            );
        }

        // OR logic: member must have at least one selected tag
        if (selectedTags.length > 0) {
            result = result.filter(member =>
                member.tags?.some(tag =>
                    selectedTags.includes(
                        typeof tag === 'object' ? tag.id : tag
                    )
                )
            );
        }

        return result;
    }, [members, searchMember, selectedTags]);


    // Count how many members have each tag
    const tagCounts = useMemo(() => {
        const counts = {};

        members.forEach(member => {
            const memberTagIds = new Set(
                (member.tags || []).map(tag =>
                    typeof tag === 'object' ? tag.id : tag
                )
            );

            memberTagIds.forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
        });

        return counts;
    }, [members]);


    return {
        filteredMembers,
        tagCounts
    };
};

export default useMemberFilters;